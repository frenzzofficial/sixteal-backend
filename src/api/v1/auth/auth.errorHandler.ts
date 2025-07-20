import { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: FastifyError | CustomError,
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const err = error as any;
    const validationErrors = err.errors.map((err: any) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    reply.status(400).send({
      success: false,
      message: "Validation error",
      errors: validationErrors,
    });
  }

  // Handle Sequelize errors
  if (error.name === "SequelizeValidationError") {
    reply.status(400).send({
      success: false,
      message: "Database validation error",
      errors:
        (error as any).errors?.map((err: any) => ({
          field: err.path,
          message: err.message,
        })) || [],
    });
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    reply.status(409).send({
      success: false,
      message: "Resource already exists",
    });
  }

  // Handle JWT errors
  if (error.code === "FST_JWT_NO_AUTHORIZATION_IN_COOKIE") {
    reply.status(401).send({
      success: false,
      message: "No authorization token provided",
    });
  }

  if (error.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID") {
    reply.status(401).send({
      success: false,
      message: "Invalid authorization token",
    });
  }

  // Handle rate limiting
  if (error.statusCode === 429) {
    reply.status(429).send({
      success: false,
      message: "Too many requests, please try again later",
    });
  }

  // Handle custom errors
  if (error.statusCode) {
    reply.status(error.statusCode).send({
      success: false,
      message: error.message || "An error occurred",
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error.message || "An unexpected error occurred";

  reply.status(statusCode).send({
    success: false,
    message,
  });
};
