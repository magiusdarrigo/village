import { Router } from "express";
import prisma from "../../clients/prismaClient";

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

export default router;
