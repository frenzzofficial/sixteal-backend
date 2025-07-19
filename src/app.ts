import dotenv from "dotenv";
import fastifyPlugin from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import Fastify, { FastifyInstance } from "fastify";
import { Home, viewConfig } from "./libs/configs/config.views";

// import all plugins
import jwtPlugin from "./libs/plugins/plugin.jwt";
import corsPlugin from "./libs/plugins/plugin.cors";
import cookiePlugin from "./libs/plugins/plugin.cookie";
import helmetPlugin from "./libs/plugins/plugin.helmet";
import swaggerPlugin from "./libs/plugins/plugin.swagger";
import swaggerUIPlugin from "./libs/plugins/plugin.swagger_ui";
import rateLimitPlugin from "./libs/plugins/plugin.rateLimits";
import dbPlugin from "./libs/database/db.plugins";

// import current version of api routes
import testRoutesPlugin from "./services/services.testRoutes";

// intialize dotenv
dotenv.config();

//initialize app instance
const App = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "warn" : "info",
    },
  });

  //register all plugins
  //serve static files
  await app.register(helmetPlugin);
  await app.register(corsPlugin);
  await app.register(rateLimitPlugin);
  await app.register(jwtPlugin);
  await app.register(cookiePlugin);
  await app.register(swaggerPlugin);
  await app.register(swaggerUIPlugin);
  await app.register(fastifyStatic, viewConfig);

  //register all database plugins
  await app.register(dbPlugin);

  //register all api routes
  //index route
  app.get("/", async (_req, reply) => {
    return reply.status(200).type("text/html").sendFile(Home);
  });

  //test route
  app.register(testRoutesPlugin);

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

  // test database plugin and connecting to mysql database
  app.register(
    fastifyPlugin((fastify, _opts, done) => {
      fastify.ready((err) => {
        if (err) {
          console.error("Error connecting to any plugin:", err);
          process.exit(1);
        }
        console.log("Successfully connected to all plugins");
      });
      done();
    })
  );

  return app;
};

export default App;
