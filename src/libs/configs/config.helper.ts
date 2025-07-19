// all kind of functions will be stored here
import type { FastifyReply } from "fastify";
import { envCookieConfig } from "./config.env";

import { OtpErrorMessagesList } from "./config.data";
import { OtpErrorMessages } from "../../types/user";

export const errOtpMessages: OtpErrorMessages | undefined =
  OtpErrorMessagesList.find((otp) => otp.language === "en");

export const OtpGenerator = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// utils/sanitizers.ts
import { IuserProfile } from "../../types/user"; // Your user type from DB or request

export const sanitizeUserProfile = (
  user: IuserProfile
): Partial<IuserProfile> => {
  const {
    id,
    fullname,
    email,
    // Leave out password, tokens, internal flags, etc.
  } = user;

  return {
    id,
    fullname,
    email,
  };
};

interface CookieOptions {
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  domain?: string;
  maxAge?: number;
}

/**
 * Safely sets an HTTP-only cookie with sane defaults.
 */
export const setCookie = (
  reply: FastifyReply,
  name: string,
  value: string,
  options: CookieOptions = {}
) => {
  const cookieDomain =
    options.domain || envCookieConfig.COOKIE_DOMAIN || "localhost";

  reply.setCookie(name, value, {
    path: options.path || "/",
    httpOnly: options.httpOnly ?? true,
    secure: options.secure ?? envCookieConfig.COOKIE_SECURE,
    sameSite: options.sameSite || "strict",
    domain: cookieDomain,
    maxAge: options.maxAge ?? 30 * 24 * 60 * 60 * 1000, // Default: 30 days
  });
};
