import fp from "fastify-plugin";
import swagger, { SwaggerOptions } from "@fastify/swagger";
import type { FastifyPluginAsync } from "fastify";
import { envAppConfig } from "../configs/config.env";

const swaggerPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    fastify.register(swagger, {
      swagger: {
        info: {
          title: "Fastify API",
          description: "Secure Fastify API with JWT Authentication",
          version: "1.0.0",
        },
        host:
          process.env.NODE_ENV === "production"
            ? envAppConfig.APP_HOST
            : `localhost:${envAppConfig.APP_PORT}`,
        schemes: process.env.NODE_ENV === "production" ? ["https"] : ["http"],
        consumes: ["application/json"],
        produces: ["application/json"],
        securityDefinitions: {
          cookieAuth: {
            type: "apiKey",
            name: "token",
            in: "cookie",
          },
        },
        security: [{ cookieAuth: [] }],
      },
      exposeRoute: process.env.NODE_ENV !== "production", // Optional: hides route in prod
    } as SwaggerOptions);
  },
  {
    name: "swagger",
  }
);

export default swaggerPlugin;
