import { RedisClientType, createClient } from "redis";

const redisUrl = process.env.REDIS_PRIVATE_URL;

if (!redisUrl) {
  throw new Error("Missing REDIS_PRIVATE_URL env variable");
}

let redisClient: RedisClientType<any, any, any>;

// sleep for 5 seconds for DNS resolver? idk bruh

redisClient = createClient({
  url: redisUrl,
})
  .on("error", (error) => {
    console.error("Error connecting to redis:", error);
    process.exit(1);
  })
  .on("connect", () => {
    console.log("Connected to redis");
  });

export default redisClient;
