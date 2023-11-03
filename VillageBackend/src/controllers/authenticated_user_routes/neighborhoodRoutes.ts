import { Router } from "express";
import prisma from "../../clients/prismaClient";
import { getPostsByUserAndNeighborhoodQuery } from "../../sql_queries/posts";
import { getNumberFromQuery } from "../../utils/casting";
import { AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

/**
 * get posts by neighborhood id
 * order by createdAt descending
 * paginate by 20 for infinite scroll on the frontend
 */
router.get("/:id/posts", async (req, res) => {
  console.log("get posts by neighborhood id called");
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const neighborhoodID = getNumberFromQuery(id);
  const cursor = getNumberFromQuery(req.query.cursor) || 0;

  if (!neighborhoodID) {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    const getPostsSqlQuery = getPostsByUserAndNeighborhoodQuery(
      currentUser.id,
      neighborhoodID,
      cursor
    );
    const posts = await prisma.$queryRaw(getPostsSqlQuery);

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching posts for timeline",
    });
  }
});

export default router;
