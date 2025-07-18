export class AppError extends Error {
  public readonly statusCode: number | undefined;
  public readonly isOperational: boolean | undefined;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "File not found") {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid request data", details?: any) {
    super(message, 404, true, details);
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized", details?: any) {
    super(message, 401, true, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden Access") {
    super(message, 403);
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: any) {
    super(message, 500, true, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429);
  }
}
export class RedisDBError extends AppError {
  constructor(message = "Error connecting with database") {
    super(message, 429);
  }
}

export class EmailError extends AppError {
  constructor(message = "Email can not be send") {
    super(message, 401);
  }
}

export class OtpError extends AppError {
  constructor(message = "Otp does not exits", details?: any) {
    super(message, 404, true, details);
  }
}
