import fp from "fastify-plugin";
import { envAppConfig } from "../libs/configs/config.env";
import type {
  FastifyInstance,
  FastifyPluginAsync,
  RouteOptions,
} from "fastify";
import authRoutesGroup from "../api/v1/auth/auth.routes";

const authRoutesPlugin_v1: FastifyPluginAsync = fp(
  async (fastify: FastifyInstance) => {
    if (envAppConfig.APP_ENV === "development") {
      authRoutesGroup.forEach((route: RouteOptions) => {
        fastify.register(
          (app, _, done) => {
            app.route(route);
            done();
          },
          { prefix: `${envAppConfig.APP_API_PATH}/v1/auth` }
        );
      });
    }
  },
  {
    name: "authRoutes_v1",
  }
);

export default authRoutesPlugin_v1;
