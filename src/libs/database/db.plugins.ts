import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import sequelize, { connectDatabase } from "./db.sequelize";
import { connect_redisDB } from "./db.redis";

// Models
// import SocialUserModel from "../models/model.SocialUsers";
import LocalUserModel from "../models/model.LocalUsers";

const dbPlugin: FastifyPluginAsync = fp(
  async (fastify) => {
    // Connect to database
    connectDatabase();
    connect_redisDB();

    // Decorate Fastify instance
    fastify.decorate("sequelize", sequelize);
    // Make model accessible
    fastify.decorate("LocalUsers", LocalUserModel);
    // fastify.decorate('SocialUsers', SocialUserModel);
  },
  {
    name: "db",
  }
);

export default dbPlugin;
