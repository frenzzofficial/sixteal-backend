import type { FastifyReply, FastifyRequest } from "fastify";
import { ValidationError } from "sequelize";

export const getTestErrorHandler = (
  err: Error,
  _req: FastifyRequest,
  reply: FastifyReply
) => {
  if (err instanceof ValidationError && err.message) {
    reply.send({ message: err.message });
  } else {
    reply.send({ message: err.message });
  }
};
