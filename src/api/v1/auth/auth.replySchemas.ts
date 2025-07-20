import { length, maxLength } from "zod";

export const signupReplySchema = {
  body: {
    type: "object",
    required: ["email", "password", "fullname"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8 },
      fullname: { type: "string", minLength: 1, maxLength: 100 },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" },
        data: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: { type: "number" },
                email: { type: "string" },
                fullname: { type: "string" },
                role: { type: "string" },
              },
              required: ["id", "email", "fullname", "role"],
            },
          },
          required: ["user"],
        },
      },
      required: ["success", "message", "data"],
    },
  },
};

export const verifyEmailReplySchema = {
  body: {
    type: "object",
    required: ["email", "otp"],
    properties: {
      email: { type: "string", format: "email" },
      otp: {
        type: "string",
        minLength: 6,
        maxLength: 6,
        pattern: "^[0-9]{6}$",
      },
    },
  },
};

export const signinReplySchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 1 },
      rememberme: { type: "boolean" },
    },
  },
};

export const changePasswordReplySchema = {
  body: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    properties: {
      currentPassword: { type: "string", minLength: 1 },
      newPassword: { type: "string", minLength: 8 },
    },
  },
};
