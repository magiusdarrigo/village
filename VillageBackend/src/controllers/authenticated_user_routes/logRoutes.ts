import { Router } from "express";
import prisma from "../../clients/prismaClient";
import {
  getPostsByUserAndNeighborhoodQuery,
  getPostsByUserAndPostIdsQuery,
} from "../../sql_queries/posts";
import { getNumberFromQuery, getBooleanFromQuery } from "../../utils/casting";
import { AuthenticatedRequest } from "../../middleware/auth";
import { MAX_INT4_VALUE } from "../../utils/constants";
import redisClient from "../../clients/redisClient";
import { log } from "console";

const router = Router();

/**
 * get posts by neighborhood id
 * paginate by 20 for infinite scroll on the frontend
 */
router.post("/", async (req, res) => {
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
