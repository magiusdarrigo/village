import { Router } from "express";
import prisma from "../../clients/prismaClient";
import { getPostsByUserAndNeighborhoodQuery } from "../../sql_queries/posts";
import { getNumberFromQuery } from "../../utils/casting";
import { AuthenticatedRequest } from "../../middleware/auth";
import { MAX_INT4_VALUE } from "../../utils/constants";

const router = Router();

/**
 * get posts by neighborhood id
 * order by createdAt descending
 * paginate by 20 for infinite scroll on the frontend
 */
router.get("/:id/posts", async (req, res) => {
  console.log("get posts by neighborhood id called, id: ", req.params.id);
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const neighborhoodID = getNumberFromQuery(id);
  const cursor = getNumberFromQuery(req.query.cursor) || MAX_INT4_VALUE;

  if (!neighborhoodID) {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    const getPostsSqlQuery = getPostsByUserAndNeighborhoodQuery(
      currentUser.id,
      neighborhoodID,
      cursor
    );
    const posts = (await prisma.$queryRaw(getPostsSqlQuery)) as any;

    const nextCursor = posts.length < 20 ? undefined : posts[19].id;

    res.json({ data: posts, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching posts for timeline",
    });
  }
});

export default router;
