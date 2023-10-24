import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

// create building
router.post("/", async (req, res) => {
  const { address } = req.body;
  try {
    // TODO: find the neighborhood that the building resides in based on the address.
    // below is a temporary solution
    const neighborhoodID = 1; // connecting to UES neighborhood ID

    const newBuilding = await prisma.building.create({
      data: {
        address,
        neighborhoodID,
      },
    });
    res.json(newBuilding);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error creating building with address ${address}`,
    });
  }
});

// update building
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { address } = req.body;
  try {
    // TODO: find the neighborhood that the building resides in based on the address.
    // below is a temporary solution
    const neighborhoodID = 1; // connecting to UES neighborhood ID

    const updatedBuilding = await prisma.building.update({
      where: {
        id: Number(id),
      },
      data: {
        address,
        neighborhoodID,
      },
    });
    res.json(updatedBuilding);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error updating building: ${id}`,
    });
  }
});

// list buildings
router.get("/", async (_, res) => {
  try {
    const buildings = await prisma.building.findMany();
    res.json(buildings);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching buildings",
    });
  }
});

// get one building
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const building = await prisma.building.findUnique({
      where: {
        id: Number(id),
      },
    });
    res.json(building);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error fetching building: ${id}`,
    });
  }
});

// delete building
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedBuilding = await prisma.building.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(deletedBuilding);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error deleting building: ${id}`,
    });
  }
});

export default router;
