import bcrypt from "bcryptjs";
import type { FastifyRequest, FastifyReply } from "fastify";
import { AuthError, ValidationError } from "../../../libs/errors/errors.app";
import { envRedisDBConfig } from "../../../libs/configs/config.env";
import { ILoginOptions, IuserProfile, OtpVerifyOptions } from "../../../types/user";
import { LocalUserModel } from "../../../libs/models/model.LocalUsers";
import { IUserProfileRoleType } from "../../../libs/configs/config.data";

import {
  sendOtp,
  verifyOtp,
  trackOtpRequests,
  userExistsStatus,
  checkOtpRestrictions,
  validateRegistration,
} from "./auth.helper";

export const signupRouteController = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const data = req.body as IuserProfile;
    validateRegistration(data);

    if (envRedisDBConfig.DB_REDIS_ON) {
      console.log("redis is on");
      const userExists = await userExistsStatus(data.email);
      if (userExists) {
        throw new ValidationError(`Email already exists: ${data.email}`);
      }

      await checkOtpRestrictions(data.email);
      await trackOtpRequests(data.email);
      await sendOtp(data.fullname, data.email, "email-otp-activation");
    } else {
      console.log("redis is off");
      const existingUser = await LocalUserModel.findByEmail(data.email);
      if (existingUser) {
        throw new ValidationError(`Email already exists: ${data.email}`);
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await LocalUserModel.create({
      email: data.email,
      password: hashedPassword,
      fullname: data.fullname,
      role: IUserProfileRoleType.DEFAULT,
    });

    reply
      .status(200)
      .type("application/json")
      .send({
        success: true,
        message:
          "User registered successfully,OTP sent to provided email. Please verify.",
        data: {
          id: newUser.dataValues.id,
        },
      });
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof ValidationError
        ? error.message
        : "Unexpected error during signup.";

    reply
      .status(error instanceof ValidationError ? 400 : 500)
      .type("application/json")
      .send({
        success: false,
        message: errorMessage,
      });
  }
};

export const verifyUserEmailRouteController = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { email, otp } = req.body as OtpVerifyOptions;

    // Validate user existence and OTP
    const existingUser = await LocalUserModel.findByEmail(email);
    if (!existingUser) {
      throw new ValidationError(`Email does not exist: ${email}`);
    }
    await verifyOtp(email, otp);

    // Get user data
    const userData = existingUser.toJSON();

    // Token payload
    const payload = {
      id: existingUser.dataValues.id,
      email: existingUser.dataValues.email,
    };

    // Issue tokens
    const accessToken = req.server.jwt.sign(payload, { expiresIn: "15m" });
    const refreshToken = req.server.jwt.sign(payload, { expiresIn: "7d" });

    // Secure cookie setup
    reply.setCookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
      domain: process.env.COOKIE_DOMAIN || "localhost",
    });

    reply.setCookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: process.env.COOKIE_DOMAIN || "localhost",
    });

    // Successful sign-in with redirect
    reply.status(201).send({
      success: true,
      message: "Email verified and user signed in",
      data: { user: userData },
    });
  } catch (error) {
    reply
      .status(400)
      .send({ success: false, message: "Verification failed", error });
  }
};

export const signinRouteController = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { email, password, rememberme } = req.body as ILoginOptions;

    if (!email || !password) {
      throw new ValidationError("Email & password are required");
    }



    // Validate user existence and OTP
    const existingUser = await LocalUserModel.findByEmail(email);
    if (!existingUser) {
      throw new AuthError("Email does not exist");
    }

    const isValidPassword = await bcrypt.compare(password, existingUser.dataValues.password);
    if (!isValidPassword) {
      return reply.status(401).send({
        success: false,
        message: "Invalid Password",
      });
    }

    await existingUser.update({ lastLogin: new Date() });

    // Get user data
    const userData = existingUser.toJSON();

    // Token payload
    const payload = {
      id: existingUser.dataValues.id,
      email: existingUser.dataValues.email,
    };

    // Token durations
    const accessExpiry = rememberme ? "60m" : "15m";
    const refreshExpiry = rememberme ? "30d" : "7d";

    // Issue tokens
    const accessToken = req.server.jwt.sign(payload, { expiresIn: accessExpiry });
    const refreshToken = req.server.jwt.sign(payload, { expiresIn: refreshExpiry });

    // Secure cookie setup
    reply.setCookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
      domain: process.env.COOKIE_DOMAIN || "localhost",
    });

    reply.setCookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: process.env.COOKIE_DOMAIN || "localhost",
    });

    // Successful sign-in with redirect
    reply.status(201).send({
      success: true,
      message: "User logged in successfully",
      data: { user: userData },
    });
  } catch (error) {
    reply
      .status(400)
      .send({ success: false, message: "Error Signing in", error });
  }
};


export const signoutRouteController = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Clear cookies with appropriate options
    const cookieDomain = process.env.COOKIE_DOMAIN || req.hostname;

    const clearCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      domain: cookieDomain,
      path: "/",
    };

    reply
      .clearCookie("access_token", clearCookieOptions)
      .clearCookie("refresh_token", clearCookieOptions);

    // logger.info(`User signed out from IP: ${req.ip}`);

    return reply.code(200).send({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    // logger.error('Signout failed', { error, ip: req.ip });

    return reply.code(500).send({
      success: false,
      message: "Logout failed. Please try again later.",
    });
  }
};

export const userProfileRouteController = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {


    reply.status(200).send({
      // data: user.toPublic(),
      success: true,
      message: "User profile fetched successfully",
    });

  } catch (error) {
    reply
      .status(400)
      .send({ success: false, message: "Error fetching user profile", error });
  }
};