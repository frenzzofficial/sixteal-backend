import { FastifyInstance } from "fastify";
import { Pool } from "mysql2";
import { Sequelize } from "sequelize";

declare module "fastify" {
  interface FastifyInstance {
    sequelize: Sequelize; // Or your actual type for the mysql client
  }
}
