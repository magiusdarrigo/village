import { Router } from "express";
import prisma from "../../clients/prismaClient";
import streamChatClient from "../../clients/streamChatClient";

const router = Router();

// create building and create building chat
router.post("/", async (req, res) => {
  console.log("create building called");
  const { address, neighborhood } = req.body;
  try {
    const newBuilding = await prisma.buildings.create({
      data: {
        address,
        neighborhood: {
          connect: {
            name: neighborhood,
          },
        },
      },
    });
    // create building chat
    const channel = streamChatClient.channel(
      "messaging",
      String(newBuilding.id),
      {
        name: address,
        created_by_id: "village-app",
      }
    );
    await channel.create();
    res.json(newBuilding);
  } catch (error) {
    // delete building if chat creation fails
    await prisma.buildings.delete({
      where: {
        address,
      },
    });
    console.error(error);
    res.status(500).json({
      error: `error creating building with address ${address}`,
    });
  }
});

// get building by address
router.get("/", async (req, res) => {
  console.log("get building by address called");
  let { address } = req.query;
  if (typeof address !== "string") {
    return res.status(400).json({
      error: "address must be a string",
    });
  }
  try {
    // get building by address and associated neighborhood name
    const building = await prisma.buildings.findUnique({
      where: {
        address,
      },
      include: {
        neighborhood: true,
      },
    });
    res.json(building);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error fetching building with address ${address}`,
    });
  }
});

export default router;
