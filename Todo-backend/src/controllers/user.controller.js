import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { UAParser } from "ua-parser-js";
import {LoginActivity} from "../models/loginActivity.model.js"
const generateAccessAndRefreshToken = async (id) => {
  try {
    console.log(id);
    const user = await User.findById(id);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(401, "Something went Wrong while generating tokens");
  }
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // use STARTTLS (upgrade connection to TLS after connecting)
  family: 4,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const genrateRandomNumber = () => {
  const number = "1234567890";
  let randomNumber = "";
  for (let i = 0; i < 6; i++) {
    const digit = number[Math.floor(Math.random() * number.length)];
    randomNumber += digit;
  }

  return randomNumber
}
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if (
    [fullName, username, email, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!email.includes("@")) {
    throw new ApiError(400, "Invaid email address");
  }

  const alreadyExistUser = await User.find({
    email: email.trim(),
    username: username.trim(),
  });

  if (!alreadyExistUser) {
    throw new ApiError(
      400,
      "Username with this email or username already exist!",
    );
  }
  const user = await User.create({
    fullName: fullName.trim(),
    email: email.trim(),
    username: username.trim(),
    password: password.trim(),
  });
  const existedUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!existedUser) {
    throw new ApiError(401, "User not created successfully!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, existedUser, "user registered successfully!"));
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

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existedUser._id,
  );
  const loggedInUser = await User.findById(existedUser._id).select(
    "-password -refreshToken",
  );
  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();
  const readableDevice = `${result.browser.name} on ${result.os.name}`;

  
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // 3. Save the log to the database
  await LoginActivity.create({
    user: loggedInUser._id, // The user who just successfully logged in
    ipAddress: clientIp,
    deviceInfo: readableDevice,
    status: "success",
  });
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refresTokeh", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Loggedin successfully!",
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
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorize access");
  }

  try {
    const decodedtoken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedtoken._id);

    if (!user) {
      throw new ApiError(400, "User not found");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(400, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: user,
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Token Generated Successfully",
        ),
      );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, error?.message || "Access token refresh failed");
  }
});

const logout = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { returnDocument: "after" },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully!"));
});

const updateDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName.trim() || !email.trim()) {
    throw new ApiError(400, "Both fields are required");
  }
  const updatedObject = { fullName, email };
  const avatarLocalPath = req.files?.avatar?.[0].path;
  const coverImageLocalPath = req.files?.coverImage?.[0].path;

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
    {
      $set: updatedObject,
    },
    { returnDocument: "after" },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Details updated successfully!"));
});

const verifyResetPassword = asyncHandler(async (req, res) => {
  const { newPassword, otp } = req.body;
  const user = await User.findById(req.user._id);
  if (!newPassword) {
    throw new ApiError(400, "new password is required");
  }

  if (Date.now() >= req.user.resetPasswordExpiry) {
    throw new ApiError(400, "OTP expired,generate new OTP");
  }
  console.log(otp, req.user.resetPasswordOtp);
  if (otp != Number(req.user.resetPasswordOtp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  user.password = newPassword.trim();
  user.resetPasswordOtp = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Password Updated"));
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  
  const randomNumber = genrateRandomNumber()

  const resetPasswordExpiry = Date.now() + 15 * 60 * 1000;
  console.log(resetPasswordExpiry);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        resetPasswordOtp: randomNumber,
        resetPasswordExpiry: resetPasswordExpiry,
      },
    },
    {
      returnDocument: "after",
    },
  ).select("-password -refreshToken -resetPasswordOtp -resetPasswordExpiry");
  await transporter.verify();
  console.log("Server is ready to take our messages");

  const info = await transporter.sendMail({
    from: '"ToDo App" <noreply@todo.com>', // sender address
    to: `${req.user.email}`, // list of recipients
    subject: "Confirm Password Change", // subject line
    text: `Hi ${req.user.fullName.toUpperCase()}, Here is your OTP. If you do not request then hange your password.`, // plain text body
    html: `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #045D4B; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 1px;">Security Verification</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #333333; font-size: 16px; margin-bottom: 20px; font-weight: bold;">
                Hi ${req.user.fullName},
              </p>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                We received a request to update the password for your account. Please use the verification code below to complete the process:
              </p>
              
              <!-- OTP Box -->
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; background-color: #f0f7f5; border: 2px dashed #045D4B; color: #045D4B; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px;">
                  ${randomNumber}
                </span>
              </div>
              
              <p style="color: #555555; font-size: 14px; text-align: center; margin-bottom: 30px;">
                <em>This code will expire in <strong>15 minutes</strong>.</em>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eeeeee; margin-bottom: 20px;" />
              
              <p style="color: #888888; font-size: 12px; line-height: 1.5;">
                If you did not request this change, your account is still secure. You can safely ignore this email. For your security, never share this code with anyone.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 15px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #aaaaaa; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} ToDo App. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>`, // HTML body
  });
  if (!info) {
    throw new ApiError(400, "Error while sendilg otp");
  }
  console.log("Message sent: %s", info.messageId);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "OTP sent successfully!"));
});

const verifyForgotPasswordOtp = asyncHandler(async (req,res) => {
  const {otp, email} = req.body

  if(!otp){
    throw new ApiError(400,"OTP is required!")
  }
  console.log(otp)
  const emailuser = await User.find({email})
  const user = emailuser[0]
  console.log(user)
  if(Date.now() >= user.resetPasswordExpiry){
    throw new ApiError(400,"OTP is expired")
  }
  if(Number(user.resetPasswordOtp) != otp){
    throw new ApiError(400,"Invalid OTP")
  }

  user.resetPasswordExpiry = undefined;
  user.resetPasswordOtp = undefined

  await user.save({ validateBeforeSave: false })


  return res.status(200).json(new ApiResponse(200, {}, "Otp verified succesfully!"));
})

const requestForgotPasswordOtp = asyncHandler(async (req,res) => {
  const {email} = req.body

  if(!email){
    throw new ApiError(400,"Email is required!")
  }

  const emailuser = await User.find({
    email
  })

  if(!emailuser){
    throw new ApiError(401,"User with this email does not exist!")
  }
  const randomNumber = genrateRandomNumber()
  const resetPasswordExpiry = Date.now() + 15 * 60 * 1000;
  console.log(resetPasswordExpiry);

  const user = await User.findByIdAndUpdate(
    emailuser[0]._id,
    {
      $set: {
        resetPasswordOtp: randomNumber,
        resetPasswordExpiry: resetPasswordExpiry,
      },
    },
    {
      "returnDocument": "after",
    },
  ).select("-password -refreshToken -resetPasswordOtp -resetPasswordExpiry");
  await transporter.verify();
  console.log("Server is ready to take our messages");
  console.log(user)
  const info = await transporter.sendMail({
    from: '"ToDO App" <noreply@todo.com>', // sender address
    to: `${email}`, // list of recipients
    subject: "Forgot Password OTP", // subject line
    text: "OTP", // plain text body
    html: `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #045D4B; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 1px;">Password Reset Request</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #333333; font-size: 16px; margin-bottom: 20px; font-weight: bold;">
                Hi ${user.fullName},
              </p>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                We received a request to reset the password for your account. Please enter the verification code below on the password reset page:
              </p>
              
              <!-- OTP Box -->
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; background-color: #f0f7f5; border: 2px dashed #045D4B; color: #045D4B; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px;">
                  ${randomNumber}
                </span>
              </div>
              
              <p style="color: #555555; font-size: 14px; text-align: center; margin-bottom: 30px;">
                <em>This code will expire in <strong>15 minutes</strong>.</em>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eeeeee; margin-bottom: 20px;" />
              
              <p style="color: #888888; font-size: 12px; line-height: 1.5;">
                If you did not request a password reset, no further action is required. Your password will remain unchanged and your account is completely secure.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 15px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #aaaaaa; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} ToDo App. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>`, // HTML body
  });

  console.log("Message sent: %s", info.messageId);

  return res.status(200).json(
    new ApiResponse(
      200,
      user,
      "OTP sent successfully!"
    )
  )
  
})

const changeForgotPassword= asyncHandler(async (req,res) => {
  const {newPassword, email} = req.body
  console.log(email)
  const emailuser = await User.find({email})
  console.log(emailuser)
  const user = await User.findById(emailuser[0]._id) 
  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Password updated Successfully!"
    )
  )

})
export {
  registerUser,
  login,
  refreshAccessToken,
  logout,
  currentUser,
  updateDetails,
  verifyResetPassword,
  requestPasswordReset,
  requestForgotPasswordOtp,
  verifyForgotPasswordOtp,
  changeForgotPassword
};
