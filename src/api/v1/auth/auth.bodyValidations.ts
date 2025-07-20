import { FastifyRequest, FastifyReply } from "fastify";
import { ZodType } from "zod";

export const validateBody = <T>(schema: ZodType<T>) => {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      request.body = schema.parse(request.body);
    } catch (error) {
      throw error; // Let error handler deal with it
    }
  };
};

export const validateParams = <T>(schema: ZodType<T>) => {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      request.params = schema.parse(request.params);
    } catch (error) {
      throw error;
    }
  };
};

export const validateQuery = <T>(schema: ZodType<T>) => {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      request.query = schema.parse(request.query);
    } catch (error) {
      throw error;
    }
  };
};
