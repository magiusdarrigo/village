import { Router } from "express";
import prisma from "../../clients/prismaClient";
import { getNumberFromQuery } from "../../utils/casting";
import { MAX_INT4_VALUE } from "../../utils/constants";
import { getUserFollowers, getUserFollowing } from "../../sql_queries/users";
import { AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// get the users that the current user is following
router.get("/:id/following", async (req, res) => {
  console.log(`get who user_id: ${req.params.id} is following`);
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const userID = id;
  const lastFollowingID =
    getNumberFromQuery(req.query.cursor) || MAX_INT4_VALUE;

  if (!userID) {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    const getFollowingSqlQuery = getUserFollowing(
      currentUser.id,
      userID,
      lastFollowingID
    );
    const following = (await prisma.$queryRaw(getFollowingSqlQuery)) as any;

    const nextCursor = following.length < 10 ? undefined : following[9].id;

    res.json({ data: following, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching who the user is following",
    });
  }
});

// get the users that are following the current user
router.get("/:id/followers", async (req, res) => {
  console.log("get followers for, user_id: ", req.params.id);
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const userID = id;
  const lastFollowerID = getNumberFromQuery(req.query.cursor) || MAX_INT4_VALUE;

  if (!userID) {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    const getFollowersSqlQuery = getUserFollowers(
      currentUser.id,
      userID,
      lastFollowerID
    );
    const followers = (await prisma.$queryRaw(getFollowersSqlQuery)) as any;

    const nextCursor = followers.length < 10 ? undefined : followers[9].id;

    res.json({ data: followers, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching followers for user",
    });
  }
});

export default router;
