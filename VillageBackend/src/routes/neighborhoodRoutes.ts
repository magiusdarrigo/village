import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// create neighborhood
router.post("/", async (req, res) => {
  const { name } = req.body;
  try {
    const newNeighborhood = await prisma.neighborhood.create({
      data: {
        name,
      },
    });
    res.json(newNeighborhood);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error creating neighborhood with name ${name}`,
    });
  }
});

// update neighborhood
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedNeighborhood = await prisma.neighborhood.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
      },
    });
    res.json(updatedNeighborhood);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error updating neighborhood: ${id}`,
    });
  }
});

// list neighborhoods
router.get("/", async (_, res) => {
  try {
    const neighborhoods = await prisma.neighborhood.findMany();
    res.json(neighborhoods);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching neighborhoods",
    });
  }
});

// get one neighborhood
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const neighborhood = await prisma.neighborhood.findUnique({
      where: {
        id: Number(id),
      },
    });
    res.json(neighborhood);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error fetching neighborhood: ${id}`,
    });
  }
});

// delete neighborhood
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedNeighborhood = await prisma.neighborhood.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(deletedNeighborhood);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error deleting neighborhood: ${id}`,
    });
  }
});

export default router;
