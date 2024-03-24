import { Router } from "express";
import prisma from "../../clients/prismaClient";

const router = Router();

router.post("", async (req, res) => {
  console.log("logs called");
  const { log } = req.body;
  try {
    const newLog = await prisma.log_entries.create({
      data: {
        log,
      },
    });
    res.status(200).json(newLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating log." });
  }
});

export default router;
