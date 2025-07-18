import fp from "fastify-plugin";
import rateLimit, { type RateLimitOptions } from "@fastify/rate-limit";
import type { FastifyPluginAsync } from "fastify";

const rateLimitPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    fastify.register(rateLimit, {
      max: 100,
      timeWindow: "1 minute",
      errorResponseBuilder: (_request, context) => ({
        success: false,
        message: `Rate limit exceeded, retry in ${context.after}`,
      }),
    } as RateLimitOptions);
  },
  {
    name: "rateLimit",
  }
);

export default rateLimitPlugin;
