import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

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
      error: `error updating user with id ${id}`,
    });
  }
});

// list users
router.get("/", async (req, res) => {
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
      error: `error getting user with id ${id}`,
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
      error: `error deleting user with id ${id}`,
    });
  }
});

export default router;
