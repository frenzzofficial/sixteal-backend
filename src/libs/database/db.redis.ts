import { Redis } from "@upstash/redis";
import { envRedisDBConfig } from "../configs/config.env";

const redis = new Redis({
  url: envRedisDBConfig.DB_URL,
  token: envRedisDBConfig.DB_TOKEN,
});

export const connect_redisDB = async () => {
  try {
    if (envRedisDBConfig.DB_REDIS_ON) {
      const pingCommandResult = await redis.ping();
      console.log("redis data base is ready to " + pingCommandResult);
    }
  } catch (error) {
    throw new Error("Unhandled Redis error");
  }
};

export default redis;
