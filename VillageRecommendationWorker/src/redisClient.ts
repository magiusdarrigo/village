import { createClient } from "redis";

const redisUrl = process.env.REDIS_PRIVATE_URL;

if (!redisUrl) {
  throw new Error("Missing REDIS_PRIVATE_URL env variable");
}

const redisClient = createClient({
  url: redisUrl,
});

export default redisClient;
