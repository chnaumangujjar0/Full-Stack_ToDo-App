import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { LoginActivity } from "../models/loginActivity.model.js";
import {
  generateAccessAndRefreshToken,
  verifySessionFromRefreshToken,
  revokeSessionByRefreshToken,
} from "../utils/token.utils.js";
import { generateOtp, OTP_EXPIRY_MS } from "../utils/otp.utils.js";
import { sendOtpEmail } from "../utils/mail.utils.js";
import { getRequestMeta } from "../utils/device.utils.js";
import { verifyAuth0Token } from "../utils/auth0.utils.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if (
    [fullName, username, email, password].some(
      (field) => !field || !field.trim(),
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!email.includes("@")) {
    throw new ApiError(400, "Invalid email address");
  }

  const alreadyExistUser = await User.findOne({
    $or: [
      { email: email.trim().toLowerCase() },
      { username: username.trim().toLowerCase() },
    ],
  });

  if (alreadyExistUser) {
    throw new ApiError(409, "User with this email or username already exists!");
  }

  const user = await User.create({
    fullName: fullName.trim(),
    email: email.trim(),
    username: username.trim(),
    password: password.trim(),
  });

  const existedUser = await User.findById(user._id).select("-password");
  if (!existedUser) {
    throw new ApiError(500, "User not created successfully!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, existedUser, "User registered successfully!"));
});

const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, "username or password is required");
  }

  const existedUser = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier.toLowerCase() },
    ],
  });

  if (!existedUser) {
    throw new ApiError(
      400,
      "This user with this username or email does not exist!",
    );
  }

  const isValidPassword = await existedUser.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid password");
  }

  const { ipAddress, userAgent } = getRequestMeta(req);

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existedUser._id,
    { ipAddress, userAgent },
  );

  const loggedInUser = await User.findById(existedUser._id).select("-password");

  await LoginActivity.create({
    user: loggedInUser._id,
    ipAddress,
    deviceInfo: userAgent,
    status: "success",
  });

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Loggedin successfully!",
      ),
    );
});

const auth0Login = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Auth0 token is missing");
  }

  let decodedToken;
  try {
    decodedToken = await verifyAuth0Token(token);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired Auth0 token");
  }

  const { email, sub, picture, nickname, name } = decodedToken;

  let user = await User.findOne({ email });

  if (!user) {
    const baseName = nickname ? nickname.replace(/[^a-zA-Z0-9]/g, "") : "user";
    const randomHash = sub.slice(-5).replace(/[^a-zA-Z0-9]/g, "x");
    const tempUsername = `${baseName}_${randomHash}`;

    user = await User.create({
      email,
      username: tempUsername,
      auth0Id: sub,
      authProvider: "auth0",
      avatar: picture,
      isProfileComplete: false,
      fullName: name,
    });
  } else if (!user.auth0Id) {
    user.auth0Id = sub;
    user.authProvider = "auth0";
    await user.save({ validateBeforeSave: false });
  }

  const { ipAddress, userAgent } = getRequestMeta(req);
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
    { ipAddress, userAgent },
  );

  await LoginActivity.create({
    user: user._id,
    ipAddress,
    deviceInfo: userAgent,
    status: "success",
  });

  const loggedInUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Auth0 login successful",
      ),
    );
});

const currentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  const { decoded } = await verifySessionFromRefreshToken(incomingRefreshToken);

  const user = await User.findById(decoded._id).select("-password");
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const accessToken = await user.generateAccessToken();

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user, accessToken },
        "Token generated successfully",
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  await revokeSessionByRefreshToken(incomingRefreshToken);

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully!"));
});

const updateDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName?.trim() || !email?.trim()) {
    throw new ApiError(400, "Both fields are required");
  }

  const updatedObject = { fullName: fullName.trim(), email: email.trim() };

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (avatarLocalPath) {
    const avatar = await uploadToCloudinary(avatarLocalPath);
    updatedObject.avatar = avatar.secure_url;
  }
  if (coverImageLocalPath) {
    const coverImage = await uploadToCloudinary(coverImageLocalPath);
    updatedObject.coverImage = coverImage.secure_url;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updatedObject },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Details updated successfully!"));
});

const completeProfile = asyncHandler(async (req, res) => {
  const { username } = req.body;
  const userId = req.user._id;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const cleanUsername = username.trim().toLowerCase();

  const existingUser = await User.findOne({ username: cleanUsername });
  if (existingUser) {
    throw new ApiError(
      409,
      "This username is already taken. Please choose another.",
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { username: cleanUsername, isProfileComplete: true } },
    { new: true },
  ).select("-password");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile completed successfully"));
});

// --- Authenticated "change my password" flow (user already logged in) ---

const requestPasswordReset = asyncHandler(async (req, res) => {
  const otp = generateOtp();
  const resetPasswordExpiry = Date.now() + OTP_EXPIRY_MS;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { resetPasswordOtp: otp, resetPasswordExpiry } },
    { new: true },
  ).select("-password -resetPasswordOtp -resetPasswordExpiry");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await sendOtpEmail({
    to: req.user.email,
    fullName: req.user.fullName,
    otp,
    subject: "Confirm Password Change",
    headerText: "Security Verification",
    introText:
      "We received a request to update the password for your account. Please use the verification code below to complete the process:",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "OTP sent successfully!"));
});

const verifyResetPassword = asyncHandler(async (req, res) => {
  const { newPassword, otp } = req.body;

  if (!newPassword?.trim()) {
    throw new ApiError(400, "New password is required");
  }
  if (!otp) {
    throw new ApiError(400, "OTP is required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.resetPasswordOtp || !user.resetPasswordExpiry) {
    throw new ApiError(400, "No OTP was requested. Please request a new one.");
  }

  if (Date.now() >= user.resetPasswordExpiry.getTime()) {
    throw new ApiError(400, "OTP expired, generate a new OTP");
  }

  if (String(otp) !== String(user.resetPasswordOtp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  user.password = newPassword.trim();
  user.resetPasswordOtp = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Password Updated"));
});

// --- Unauthenticated "forgot password" flow (identified by email) ---

const requestForgotPasswordOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required!");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If this email is registered, an OTP has been sent.",
        ),
      );
  }

  const otp = generateOtp();
  user.resetPasswordOtp = otp;
  user.resetPasswordExpiry = Date.now() + OTP_EXPIRY_MS;
  await user.save({ validateBeforeSave: false });

  await sendOtpEmail({
    to: user.email,
    fullName: user.fullName,
    otp,
    subject: "Forgot Password OTP",
    headerText: "Password Reset Request",
    introText:
      "We received a request to reset the password for your account. Please enter the verification code below on the password reset page:",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "If this email is registered, an OTP has been sent.",
      ),
    );
});

const verifyForgotPasswordOtp = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;

  if (!otp || !email) {
    throw new ApiError(400, "Email and OTP are required!");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (
    !user.resetPasswordOtp ||
    !user.resetPasswordExpiry ||
    Date.now() >= user.resetPasswordExpiry.getTime()
  ) {
    throw new ApiError(400, "OTP is expired or was never requested");
  }

  if (String(user.resetPasswordOtp) !== String(otp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  user.resetPasswordOtp = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  
  const resetToken = jwt.sign(
    { _id: user._id, purpose: "password_reset" },
    process.env.RESET_PASSWORD_TOKEN_SECRET,
    { expiresIn: "10m" },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { resetToken }, "OTP verified successfully!"));
});

const changeForgotPassword = asyncHandler(async (req, res) => {
  const { newPassword, resetToken } = req.body;

  if (!newPassword?.trim()) {
    throw new ApiError(400, "New password is required");
  }
  if (!resetToken) {
    throw new ApiError(400, "Reset token is required");
  }

  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.RESET_PASSWORD_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Reset token is invalid or expired");
  }

  if (decoded.purpose !== "password_reset") {
    throw new ApiError(401, "Invalid reset token");
  }

  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.password = newPassword.trim();
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated Successfully!"));
});

export {
  registerUser,
  login,
  auth0Login,
  refreshAccessToken,
  logout,
  currentUser,
  updateDetails,
  completeProfile,
  requestPasswordReset,
  verifyResetPassword,
  requestForgotPasswordOtp,
  verifyForgotPasswordOtp,
  changeForgotPassword,
};
