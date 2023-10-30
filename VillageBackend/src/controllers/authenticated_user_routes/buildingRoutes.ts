import { Router } from "express";
import prisma from "../../clients/prismaClient";

const router = Router();

// create building
router.post("/", async (req, res) => {
  const { address } = req.body;
  try {
    // TODO: find the neighborhood that the building resides in based on the address.
    // below is a temporary solution
    const neighborhoodID = 1; // connecting to UES neighborhood ID

    const newBuilding = await prisma.buildings.create({
      data: {
        address,
        neighborhood_id: neighborhoodID,
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

export default router;
