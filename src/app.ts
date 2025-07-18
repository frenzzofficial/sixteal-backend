import dotenv from "dotenv";
dotenv.config();
import fastifyStatic from "@fastify/static";
import Fastify, { FastifyInstance } from "fastify";
import { Home, viewConfig } from "./libs/configs/config.views";

const App = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "warn" : "info",
    },
  });

  //register all plugins
  //serve static files
  await app.register(fastifyStatic, viewConfig);

  //register all api routes
  //index route
  app.get("/", async (_req, reply) => {
    return reply.status(200).type("text/html").sendFile(Home);
  });

  // Health check endpoint
  app.get("/api/health", async (_request, reply) => {
    return reply.send({
      success: true,
      message: "API is running",
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({
      success: false,
      message: "Route not found",
    });
  });

  return app;
};

export default App;
