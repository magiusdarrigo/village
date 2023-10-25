import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

// create user
router.post("/", async (req, res) => {
  const { username, email } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
      },
    });
    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error creating user with username ${username} and email ${email}`,
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
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        image,
        isVerified,
        neighborhoodID,
        buildingID,
        followersCount,
        followingCount,
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
    const allUsers = await prisma.user.findMany();
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
    const user = await prisma.user.findUnique({
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
    const deletedUser = await prisma.user.delete({
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
  const followerID = req.body.followerID;

  try {
    const createFollowing = prisma.userFollowing.create({
      data: {
        followerUserID: followerID,
        followingUserID: Number(id),
      },
    });

    const incrementFollowingCount = prisma.user.update({
      where: { id: followerID },
      data: { followingCount: { increment: 1 } },
    });

    const incrementFollowersCount = prisma.user.update({
      where: { id: Number(id) },
      data: { followersCount: { increment: 1 } },
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
  // the id of the user who is following
  const followerID = req.body.followerID;

  try {
    const deleteFollowing = prisma.userFollowing.deleteMany({
      where: {
        followerUserID: followerID,
        followingUserID: Number(id),
      },
    });

    const decrementFollowingCount = prisma.user.update({
      where: { id: followerID },
      data: { followingCount: { decrement: 1 } },
    });

    const decrementFollowersCount = prisma.user.update({
      where: { id: Number(id) },
      data: { followersCount: { decrement: 1 } },
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

export default router;
