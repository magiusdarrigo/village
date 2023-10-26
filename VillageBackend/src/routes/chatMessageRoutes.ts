/**
 * THIS ROUTER IS UNDER CONSTRUCTION
 * TODO: ADD REALTIME STREAMING FOR CHAT MESSAGES
 */

import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

// create chat message
router.post("/", async (req, res) => {
  const { userID, buildingID, textContent, tags } = req.body;
  try {
    const newMessage = await prisma.chat_messages.create({
      data: {
        user_id: userID,
        building_id: buildingID,
        text_content: textContent,
        tags,
      },
    });
    res.json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error creating chat message from user: ${userID}`,
    });
  }
});

// get chat messages by building id
router.get("/", async (req, res) => {
  const { buildingID } = req.query;

  if (!buildingID) {
    return res.status(400).json({ error: "buildingID is required" });
  }

  try {
    const messages = await prisma.chat_messages.findMany({
      where: {
        building_id: Number(buildingID),
      },
      orderBy: {
        created_at: "desc",
      },
    });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching chat messages for building",
    });
  }
});

// update chat message
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { textContent, tags } = req.body;
  try {
    const updatedMessage = await prisma.chat_messages.update({
      where: {
        id: Number(id),
      },
      data: {
        text_content: textContent,
        tags,
      },
    });
    res.json(updatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error updating chat message: ${id}`,
    });
  }
});

// delete chat message
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedMessage = await prisma.chat_messages.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(deletedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error deleting chat message: ${id}`,
    });
  }
});

export default router;
