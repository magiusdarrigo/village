import { Router } from "express";
import prisma from "../../clients/prismaClient";
import {
  getPostsByUserAndNeighborhoodQuery,
  getPostsByUserAndPostIdsQuery,
} from "../../sql_queries/posts";
import { getNumberFromQuery, getBooleanFromQuery } from "../../utils/casting";
import { AuthenticatedRequest } from "../../middleware/auth";
import { MAX_INT4_VALUE } from "../../utils/constants";
import redisClient from "../../clients/redisClient";

const router = Router();

// get all neighborhoods
router.get("/", async (req, res) => {
  console.log("get all neighborhoods called");
  try {
    const neighborhoods = await prisma.neighborhoods.findMany({
      where: {
        is_hidden: false,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        is_locked: true,
        borough: true,
      },
    });
    res.json({ data: neighborhoods });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error fetching neighborhoods" });
  }
});

/**
 * get posts by neighborhood id
 * paginate by 20 for infinite scroll on the frontend
 */
router.get("/:id/posts", async (req, res) => {
  console.log("get posts by neighborhood id called, id: ", req.params.id);
  const { id } = req.params;
  const { is_hot, cache_key } = req.query;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const neighborhoodID = getNumberFromQuery(id);
  const cursor = getNumberFromQuery(req.query.cursor) || MAX_INT4_VALUE;
  const isHot = getBooleanFromQuery(is_hot);
  const cacheKey = cache_key as string | undefined;

  if (!neighborhoodID) {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    const { posts, nextCursor } = isHot
      ? await getHotPosts(currentUser.id, neighborhoodID, cursor, cacheKey)
      : await getNewPosts(currentUser.id, neighborhoodID, cursor);

    // const postTexts = posts?.map((post: any) => post.id) || [];
    // console.log("post ids: ", postTexts);
    // console.log("total posts returned: ", posts?.length);
    // console.log("nextCursor: ", nextCursor);

    res.json({ data: posts, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching posts for timeline",
    });
  }
});

const getHotPosts = async (
  userID: string,
  neighborhoodID: number,
  cursor: number,
  cacheKey: string | undefined
) => {
  let key = cacheKey;
  if (!cacheKey || !cursor) {
    // if cursor is MAX_INT4_VALUE, then we need to get the latest key in the redis sorted set
    const newestKeys = await redisClient.zRange(
      `neighborhood_index:${neighborhoodID}`,
      0,
      0,
      {
        REV: true,
      }
    );

    key = newestKeys.length > 0 ? newestKeys[0] : undefined;
  }

  if (!key) {
    throw new Error("No key found");
  }

  const postIDs = await redisClient.get(key);
  if (!postIDs) {
    throw new Error("No post ids found");
  }

  const parsedPostIDs = JSON.parse(postIDs) as number[];
  // get the post ids that are greater than the cursor. Limit it to 20
  const postIDsToGet = parsedPostIDs
    .filter((postID) => postID < cursor)
    .slice(0, 20);

  const nextCursor = postIDsToGet.length < 20 ? undefined : postIDsToGet[19];

  if (postIDsToGet.length === 0) {
    return { posts: [], nextCursor };
  }

  const sqlQuery = getPostsByUserAndPostIdsQuery(userID, postIDsToGet);
  const posts = (await prisma.$queryRaw(sqlQuery)) as any;

  const sortedPosts = postIDsToGet
    .map((id) => posts.find((post: any) => post.id === id))
    .filter((post) => post !== undefined);

  return { posts: sortedPosts, nextCursor };
};

const getNewPosts = async (
  userID: string,
  neighborhoodID: number,
  cursor: number
) => {
  const sqlQuery = getPostsByUserAndNeighborhoodQuery(
    userID,
    neighborhoodID,
    cursor
  );
  const posts = (await prisma.$queryRaw(sqlQuery)) as any;
  const nextCursor = posts.length < 20 ? undefined : posts[19].id;
  return { posts, nextCursor };
};

/**
 * get the "members_count" for a neighborhood
 */
router.get("/:id/members/count", async (req, res) => {
  console.log("get members count called, id: ", req.params.id);
  const { id } = req.params;
  const neighborhoodID = getNumberFromQuery(id);

  if (!neighborhoodID) {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    const neighborhood = await prisma.neighborhoods.findUnique({
      where: {
        id: neighborhoodID,
      },
      select: {
        members_count: true,
      },
    });

    res.json(neighborhood);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching members count for neighborhood",
    });
  }
});

export default router;
