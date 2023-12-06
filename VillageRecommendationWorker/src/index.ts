import supabaseClient from "./supabaseClient";
import createRedisClient from "./redisClient";
import { rankPosts } from "./ranking";
import { RedisClientType } from "redis";

const storePostsRankingsForNeighborhood = async (
  redisClient: RedisClientType<any, any, any>,
  neighborhoodID: number
) => {
  // get the 1000 newest posts from the neighborhood
  const { data: posts, error } = await supabaseClient
    .from("posts")
    .select("id,created_at,likes_count,comments_count")
    .eq("neighborhood_id", neighborhoodID)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  // sort the posts by the ranking algorithm
  const rankedPostIDs = rankPosts(posts);

  // store the sorted post IDs in Redis
  const timestamp = Date.now();
  const key = `neighborhood:${neighborhoodID}:${timestamp}`;
  const value = JSON.stringify(rankedPostIDs);
  // store the key for 2 hours
  await redisClient.set(key, value, {
    EX: 7200, // 2 hours
  });
  // add the key to the sorted set
  await redisClient.zAdd(`neighborhood_index:${neighborhoodID}`, [
    { score: timestamp, value: key },
  ]);
  // let's purge the sorted set of old keys
  await redisClient.zRemRangeByScore(
    `neighborhood_index:${neighborhoodID}`,
    0,
    timestamp - 7200 * 1000 // 2 hours ago in milliseconds
  );

  // let's return the key used and the number of posts ranked
  return { key, count: rankedPostIDs.length };
};

const getAllNeighborhoods = async () => {
  const { data: neighborhoods, error } = await supabaseClient
    .from("neighborhoods")
    .select("id");

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  return neighborhoods;
};

const main = async () => {
  // Start the Redis connection
  const redisClient = await createRedisClient();

  const neighborhoods = await getAllNeighborhoods();
  if (!neighborhoods) {
    throw new Error("No neighborhoods found");
  }
  for (const neighborhood of neighborhoods) {
    const result = await storePostsRankingsForNeighborhood(
      redisClient,
      neighborhood.id
    );
    if (!result) {
      console.log(`error storing rankings for neighborhood ${neighborhood.id}`);
      continue;
    }
    const { key, count } = result;
    console.log(
      `stored ${count} rankings for neighborhood: ${neighborhood.id}, under the key: ${key}`
    );
  }
  // End the Redis connection
  await redisClient.quit();
};
main();
