import { Router } from "express";
import prisma from "../../clients/prismaClient";
import { getNumberFromQuery } from "../../utils/casting";
import { MAX_INT4_VALUE } from "../../utils/constants";
import { getUserFollowers } from "../../sql_queries/users";

const router = Router();

// get the users that the current user is following

// get the users that are following the current user
router.get("/:id/followers", async (req, res) => {
  console.log("get followers for, user_id: ", req.params.id);
  const { id } = req.params;
  const userID = id;
  const lastFollowerID = getNumberFromQuery(req.query.cursor) || MAX_INT4_VALUE;

  if (!userID) {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    const getFollowersSqlQuery = getUserFollowers(userID, lastFollowerID);
    const followers = (await prisma.$queryRaw(getFollowersSqlQuery)) as any;

    const nextCursor = followers.length < 20 ? undefined : followers[19].id;

    res.json({ data: followers, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching followers for user",
    });
  }
});

export default router;
