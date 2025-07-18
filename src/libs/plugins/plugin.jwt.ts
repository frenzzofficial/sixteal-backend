import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { envAppConfig, envJWTConfig } from "../configs/config.env";
import fastifyJWT, { type FastifyJWTOptions } from "@fastify/jwt";

const jwtPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    if (
      envAppConfig.APP_ENV === "development" &&
      !envJWTConfig.JWT_SECRET_TOKEN
    ) {
      throw new Error("JWT_SECRET_TOKEN is not set in env file");
    }
    fastify.register(fastifyJWT, {
      secret: envJWTConfig.JWT_SECRET_TOKEN,
      cookie: {
        cookieName: "token",
        signed: false,
      },
    } as FastifyJWTOptions);
  },
  {
    name: "jwt",
  }
);

export default jwtPlugin;
