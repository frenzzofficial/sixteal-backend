import { envAppConfig } from "./config.env";

export const whiteListedServer = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://localhost:7164",
];

export const blackListedIPs = [];

export const allowedOrigins = [
  `http://localhost:${envAppConfig.APP_PORT}`,
  "http://localhost:3000",
  `http://upstash.io`,
  "https://accounts.google.com",
];
