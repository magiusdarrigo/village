import { createClient } from "redis";

const redisUrl = process.env.REDIS_PRIVATE_URL;

if (!redisUrl) {
  throw new Error("Missing REDIS_PRIVATE_URL env variable");
}

const createRedisClient = async () => {
  return await createClient({
    url: redisUrl,
  })
    .on("error", (error) => {
      console.error("Redis create client error:", error);
    })
    .on("connect", () => {
      console.log("Redis client connected");
    })
    .connect();
};

export default createRedisClient;
