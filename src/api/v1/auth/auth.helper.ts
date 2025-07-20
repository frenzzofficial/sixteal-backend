import { IuserProfile } from "../../../types/user";
import redis from "../../../libs/database/db.redis";
import { envRedisDBConfig } from "../../../libs/configs/config.env";
import { IUserProfileRoleType } from "../../../libs/configs/config.data";
import { OtpError, ValidationError } from "../../../libs/errors/errors.app";
import { LocalUserModel } from "../../../libs/models/model.LocalUsers";
import {
  sendEmail_params,
  sendEmail,
} from "../../../libs/configs/config.emails";
import {
  errOtpMessages,
  OtpGenerator,
} from "../../../libs/configs/config.helper";

export const validateRegistration = (
  data: IuserProfile,
  userProfileType?: IUserProfileRoleType
) => {
  const { fullname, email, password, phone_number } = data;
  if (
    !fullname ||
    !email ||
    !password ||
    (userProfileType === "SELLER" && !phone_number)
  ) {
    throw new ValidationError(`missing required fields`);
  }
};

const USER_EXISTS_KEY = (email: string) => `user_exists:${email}`;
const CACHE_TTL_SECONDS = 300; // 5 minutes

export const userExistsInDB = async (email: string): Promise<boolean> => {
  try {
    const existingUser = await LocalUserModel.findOne({ where: { email } });
    const status = existingUser ? "true" : "false";

    // Store existence status in Redis
    if (envRedisDBConfig.DB_REDIS_ON) {
      await redis.set(USER_EXISTS_KEY(email), status, {
        ex: CACHE_TTL_SECONDS,
      });
    }

    return existingUser !== null;
  } catch (err) {
    console.error(`[userExistsInDB] DB error for ${email}:`, err);
    return false; // fallback conservatively
  }
};

export const userExistsStatus = async (email: string): Promise<boolean> => {
  try {
    if (envRedisDBConfig.DB_REDIS_ON) {
      const cachedStatus = await redis.get(USER_EXISTS_KEY(email));

      if (cachedStatus !== null) {
        return cachedStatus === "true";
      }
    }

    // Fallback to DB check if cache miss
    return await userExistsInDB(email);
  } catch (err) {
    console.error(`[userExistsStatus] Redis error for ${email}:`, err);
    // Fallback to DB if Redis fails
    return await userExistsInDB(email);
  }
};

export const checkOtpRestrictions = async (email: string): Promise<true> => {
  const lockStates: Array<{
    key: string;
    message: string | undefined;
  }> = [
    { key: `otp_lock:${email}`, message: errOtpMessages?.otp_Lock_message },
    {
      key: `otp_spam_lock:${email}`,
      message: errOtpMessages?.otp_Spam_message,
    },
    {
      key: `otp_cooldown:${email}`,
      message: errOtpMessages?.otp_Cooldown_message,
    },
  ];

  for (const { key, message } of lockStates) {
    const isLocked = await redis.get(key);
    if (Boolean(isLocked)) {
      throw new ValidationError(message ?? "OTP restriction triggered");
    }
  }

  return true;
};

export const trackOtpRequests = async (email: string): Promise<void> => {
  const OTP_MAX_REQUESTS = 2;
  const OTP_EXPIRY_SECONDS = 3600; // 1 hour

  const otpRequestKey = `otp_request_count:${email}`;
  const lockKey = `otp_spam_lock:${email}`;

  try {
    const rawCount = (await redis.get(otpRequestKey)) as string | null;
    if (rawCount === null) {
      await redis.set(otpRequestKey, "1", { ex: OTP_EXPIRY_SECONDS });
      return;
    }
    const otpRequests = Number.isNaN(Number(rawCount))
      ? 0
      : parseInt(rawCount!, 10);

    if (otpRequests >= OTP_MAX_REQUESTS) {
      await redis.set(lockKey, "true", { ex: OTP_EXPIRY_SECONDS });

      const message =
        errOtpMessages?.otp_Cooldown_message ?? "OTP request cooldown active";
      throw new ValidationError(message);
    }

    const newCount = otpRequests + 1;
    await redis.set(otpRequestKey, newCount.toString(), {
      ex: OTP_EXPIRY_SECONDS,
    });
  } catch (error) {
    // Optionally use a logger here
    console.error(`OTP tracking error for ${email}:`, error);

    // Re-throw to preserve upstream behavior
    throw error instanceof ValidationError
      ? error
      : new Error("Internal OTP tracking error");
  }
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
): Promise<void> => {
  const OTP = OtpGenerator(100000, 999999).toString();

  const OTP_EXPIRY_SECONDS = 300; // Valid for 5 minutes
  const COOLDOWN_EXPIRY_SECONDS = 300; // Prevent rapid resend attempts

  const redisOtpKey = `otp:${email}`;
  const redisCooldownKey = `otp_cooldown:${email}`;

  const emailPayload: sendEmail_params = {
    to: email,
    subject: "Verify your email",
    templateName: template,
    data: {
      name,
      otp: OTP,
    },
  };

  try {
    await sendEmail(emailPayload);
    await Promise.all([
      redis.set(redisOtpKey, OTP, { ex: OTP_EXPIRY_SECONDS }),
      redis.set(redisCooldownKey, "true", { ex: COOLDOWN_EXPIRY_SECONDS }),
    ]);
  } catch (error) {
    console.error(`Error sending OTP to ${email}:`, error);
    throw new Error(errOtpMessages?.otp_SendFailure ?? "Failed to send OTP");
  }
};

export const verifyOtp = async (email: string, otp: string): Promise<void> => {
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp) {
    throw new OtpError(
      errOtpMessages?.otp_Invalid_message ?? "OTP expired or missing"
    );
  }

  const ATTEMPT_KEY = `otp_attempt_key:${email}`;
  const LOCK_KEY = `otp_lock:${email}`;
  const MAX_ATTEMPTS = 2;

  const currentAttemptsRaw = (await redis.get(ATTEMPT_KEY)) as string | null;
  const currentAttempts = Number.isNaN(Number(currentAttemptsRaw))
    ? 0
    : parseInt(currentAttemptsRaw!, 10);

  if (parseInt(storedOtp as string, 10) !== parseInt(otp, 10)) {
    if (currentAttempts >= MAX_ATTEMPTS) {
      await redis.set(LOCK_KEY, "true", { ex: 1800 }); // 30 min lock
      await redis.del(`otp:${email}`, ATTEMPT_KEY);

      throw new ValidationError(
        errOtpMessages?.otp_Attempts_message ?? "Too many failed attempts"
      );
    }

    const remainingAttempts = MAX_ATTEMPTS - (currentAttempts + 1);
    await redis.set(ATTEMPT_KEY, (currentAttempts + 1).toString(), { ex: 300 });

    throw new ValidationError(
      `Incorrect OTP. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} left`
    );
  }

  // OTP verified successfully — cleanup keys
  await redis.del(`otp:${email}`, ATTEMPT_KEY);
};
