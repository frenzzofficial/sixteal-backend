// import { Redis } from "@upstash/redis";
// import { envRedisDB } from "../constants/config.env";

// const redis = new Redis({
//   url: envRedisDB.DB_URL,
//   token: envRedisDB.DB_TOKEN,
// });

// export const connect_redisDB = async () => {
//   try {
//     const pingCommandResult = await redis.ping();
//     console.log("redis data base is ready to " + pingCommandResult);
//   } catch (error) {
//     throw new Error("Unhandled Redis error");
//   }
// };

// export default redis;
