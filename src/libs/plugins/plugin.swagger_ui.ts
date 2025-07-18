import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import swaggerUI, { FastifySwaggerUiOptions } from "@fastify/swagger-ui";

const swaggerUIPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    fastify.register(swaggerUI, {
      routePrefix: "/documentation",
      uiConfig: {
        docExpansion: "full",
        deepLinking: false,
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
    } as FastifySwaggerUiOptions);
  },
  {
    name: "swaggerUI",
  }
);

export default swaggerUIPlugin;
