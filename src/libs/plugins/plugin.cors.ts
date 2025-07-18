import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import cors, { type FastifyCorsOptions } from "@fastify/cors";
import { allowedOrigins } from "../configs/config.serverlist";

const corsPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    fastify.register(cors, {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type"],
      credentials: true,
      strictPreflight: true,
      optionsSuccessStatus: 204,
    } as FastifyCorsOptions);
  },
  {
    name: "cors",
  }
);

export default corsPlugin;
