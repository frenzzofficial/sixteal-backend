import { z } from "zod";

export const signupSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  fullname: z
    .string()
    .min(1, "Fullname is required")
    .max(100, "Fullname too long"),
});

export const emalOtpVerifySchema = z.object({
  email: z
    .email({ message: "Invalid email address" })
    .max(254, { message: "Email too long" }),

  otp: z
    .string()
    .length(6, { message: "OTP must be exactly 6 digits" })
    .regex(/^\d{6}$/, { message: "OTP must be numeric" }),
});

export const signinSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememerme: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long"),
});

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name too long")
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name too long")
    .optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
