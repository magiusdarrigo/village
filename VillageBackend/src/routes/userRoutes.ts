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
    res.status(400).json({
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
});

// list users
router.get("/", async (req, res) => {
  const allUsers = await prisma.user.findMany();
  res.json(allUsers);
});

// get one user
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
  });
  res.json(user);
});

// delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const deletedUser = await prisma.user.delete({
    where: {
      id: Number(id),
    },
  });
  res.json(deletedUser);
});

export default router;
