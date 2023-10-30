import { Router } from "express";
import prisma from "../../clients/prismaClient";
import { getPostsByUserQuery } from "../../sql_queries/posts";
import { getNumberFromQuery } from "../../utils/casting";
import { AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// create user
router.post("/", async (req, res) => {
  const { username, phoneNumber } = req.body;
  try {
    const newUser = await prisma.users.create({
      data: {
        username,
        phone_number: phoneNumber,
      },
    });
    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error creating user with username ${username} and phone number ${phoneNumber}`,
    });
  }
});

// update user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    image,
    isVerified,
    neighborhoodID,
    buildingID,
    followersCount,
    followingCount,
  } = req.body;
  try {
    const updatedUser = await prisma.users.update({
      where: {
        id: Number(id),
      },
      data: {
        image,
        is_verified: isVerified,
        neighborhood_id: neighborhoodID,
        building_id: buildingID,
        followers_count: followersCount,
        following_count: followingCount,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error updating user: ${id}`,
    });
  }
});

// list users
router.get("/", async (_, res) => {
  try {
    const allUsers = await prisma.users.findMany();
    res.json(allUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error listing users`,
    });
  }
});

// get one user
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: Number(id),
      },
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error getting user: ${id}`,
    });
  }
});

// delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await prisma.users.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(deletedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error deleting user: ${id}`,
    });
  }
});

// follow a user
router.post("/:id/follow", async (req, res) => {
  const { id } = req.params;
  // the id of the user who is following
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  try {
    const createFollowing = prisma.user_following.create({
      data: {
        follower_user_id: currentUser.id,
        following_user_id: Number(id),
      },
    });

    const incrementFollowingCount = prisma.users.update({
      where: { id: currentUser.id },
      data: { following_count: { increment: 1 } },
    });

    const incrementFollowersCount = prisma.users.update({
      where: { id: Number(id) },
      data: { followers_count: { increment: 1 } },
    });

    await prisma.$transaction([
      createFollowing,
      incrementFollowingCount,
      incrementFollowersCount,
    ]);

    res.status(200).json({ message: "Successfully followed the user." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error following the user." });
  }
});

// unfollow a user
router.delete("/:id/follow", async (req, res) => {
  const { id } = req.params;
  // the id of the user who is unfollowing
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  try {
    const deleteFollowing = prisma.user_following.deleteMany({
      where: {
        follower_user_id: currentUser.id,
        following_user_id: Number(id),
      },
    });

    const decrementFollowingCount = prisma.users.update({
      where: { id: currentUser.id },
      data: { following_count: { decrement: 1 } },
    });

    const decrementFollowersCount = prisma.users.update({
      where: { id: Number(id) },
      data: { followers_count: { decrement: 1 } },
    });

    await prisma.$transaction([
      deleteFollowing,
      decrementFollowingCount,
      decrementFollowersCount,
    ]);

    res.status(200).json({ message: "Successfully unfollowed the user." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error unfollowing the user." });
  }
});

/**
 * get posts by user id
 * order by createdAt descending
 * paginate by 10 for infinite scroll on the frontend
 */
router.get("/:id/posts", async (req, res) => {
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const cursor = getNumberFromQuery(req.query.cursor) || 0;

  try {
    const getPostsSqlQuery = getPostsByUserQuery(currentUser.id, cursor);
    const posts = await prisma.$queryRaw(getPostsSqlQuery);

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching posts for profile",
    });
  }
});

export default router;
