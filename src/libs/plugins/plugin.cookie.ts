import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import cookie, { type FastifyCookieOptions } from "@fastify/cookie";
import {
  envAppConfig,
  envCookieConfig,
  envJWTConfig,
} from "../configs/config.env";

const cookiePlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    if (
      envAppConfig.APP_ENV === "development" &&
      !envJWTConfig.JWT_SECRET_TOKEN
    ) {
      throw new Error("JWT_SECRET_TOKEN is not set in env file");
    }
    fastify.register(cookie, {
      secret: envJWTConfig.JWT_SECRET_TOKEN,
      parseOptions: {
        sameSite: "none",
        secure: envCookieConfig.COOKIE_SECURE, // true in prod (HTTPS), false in dev (HTTP)
        httpOnly: true,
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    } as FastifyCookieOptions);
  },
  {
    name: "cookie",
  }
);

export default cookiePlugin;
