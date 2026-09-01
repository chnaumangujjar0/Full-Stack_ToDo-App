import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { ApiError } from "./apiError.js";

const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days fallback

const parseExpiryToMs = (expiry) => {
    if (!expiry) return DEFAULT_SESSION_TTL_MS;
  const value = Number(expiry.slice(0, -1));
    const unit = expiry.slice(-1).toLowerCase();

    const date = new Date();

    if (unit === "d") {
        date.setDate(date.getDate() + value);
    }
    if (unit === "h") {
        date.setHours(date.getHours() + value);
    }
    if (unit === "m") {
        date.setMinutes(date.getMinutes() + value);
    }
    if (unit === "s") {
        date.setSeconds(date.getSeconds() + value);
    }
    return date;
};

export const generateAccessAndRefreshToken = async (userId, meta = {}) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found while generating tokens");
  }

  try {
    const accessToken = await user.generateAccessToken();

    // Create the session first so we have an _id to embed in the refresh
    // token. The real refresh token is set (and hashed by the pre-save
    // hook) right after.
    const session = await Session.create({
      user: user._id,
      refreshToken: "pending",
      ipAddress: meta.ipAddress || null,
      userAgent: meta.userAgent || null,
      expiresAt: new Date(parseExpiryToMs(process.env.REFRESH_TOKEN_EXPIRY.toString())
      ),
    });

    const refreshToken = jwt.sign(
      { _id: user._id, sid: session._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    session.refreshToken = refreshToken; 
    await session.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

export const verifySessionFromRefreshToken = async (incomingRefreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Refresh token is invalid or expired");
  }

  const session = await Session.findById(decoded.sid);
  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    throw new ApiError(401, "Session is expired or has been revoked");
  }

  if (session.user.toString() !== decoded._id) {
    throw new ApiError(401, "Refresh token does not match session");
  }

  const isValid = await session.isSessionValid(incomingRefreshToken);
  if (!isValid) {
    throw new ApiError(401, "Refresh token is invalid");
  }

  return { decoded, session };
};

export const revokeSessionByRefreshToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) return;
  try {
    const decoded = jwt.decode(incomingRefreshToken);
    if (decoded?.sid) {
      await Session.findByIdAndUpdate(decoded.sid, { revokedAt: new Date() });
    }
  } catch (error) {
  }
};