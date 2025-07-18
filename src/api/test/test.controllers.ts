import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

export const getTestRoute = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { test } = req.query as { test: string };
    if (!test) {
      return reply.code(400).send({ message: "test is required" });
    }
    return reply.send({ message: "test is working" });
  } catch (err) {
    return reply.code(500).send({ error: err });
  }
};
