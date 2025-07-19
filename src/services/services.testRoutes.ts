import fp from "fastify-plugin";
import { envAppConfig } from "../libs/configs/config.env";
import type {
  FastifyInstance,
  FastifyPluginAsync,
  RouteOptions,
} from "fastify";

import testRoutesGroup from "../api/test/test.routes";

const testRoutesPlugin: FastifyPluginAsync = fp(
  async (fastify: FastifyInstance) => {
    if (envAppConfig.APP_ENV === "development") {
      testRoutesGroup.forEach((route: RouteOptions) => {
        fastify.register(
          (app, _, done) => {
            app.route(route);
            done();
          },
          { prefix: `${envAppConfig.APP_API_PATH}` }
        );
      });
    }
  },
  {
    name: "testRoutes",
  }
);

export default testRoutesPlugin;
