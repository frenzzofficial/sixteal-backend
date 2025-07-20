import type { UUID } from "node:crypto";
import { IUserProfileRoleType } from "../libs/configs/config.data";
export interface IuserProfile {
  id: number;
  uid: string;
  email: string;
  password: string;
  role: IUserProfileRoleType;
  fullname: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  username?: string;
  avatar?: string;
  phone_number?: string;
  address?: Array<string> | string | undefined;
}

export interface OtpErrorMessages {
  language: string;
  otp_Lock_message: string;
  otp_Spam_message: string;
  otp_Cooldown_message: string;
  otp_Attempts_message: string;
  otp_Invalid_message: string;
  otp_SendFailure: string;
}

export interface OtpVerifyOptions {
  email: string;
  otp: string;
}
export interface ILoginOptions {
  email: string;
  password: string;
  rememberme?: boolean;
}
export interface IUserEmailOptions {
  email: string;
}
export interface IUserResetPasswordOptions {
  email: string;
  newPassword: string;
}

export interface IUserVerifyOtp {
  email: string;
  otp: string;
}
