import { Router } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { getTop10CommentsFromPostQuery } from "../sql_queries/comments";

const router = Router();
const prisma = new PrismaClient();

// create comment
router.post("/", async (req, res) => {
  const { userID, postID, textContent, parentCommentID } = req.body;
  try {
    const newComment = await prisma.comment.create({
      data: {
        userID,
        postID,
        textContent,
        parentCommentID,
      },
    });
    res.json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error creating comment from user: ${userID}`,
    });
  }
});

// update comment
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { textContent, likesCount } = req.body;
  try {
    const updatedComment = await prisma.comment.update({
      where: {
        id: Number(id),
      },
      data: {
        textContent,
        likesCount,
      },
    });
    res.json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error updating comment: ${id}`,
    });
  }
});

/**
 * get comments by post id
 * order comments by likesCount descending
 * paginate by 10 for infinite scroll on the frontend
 * all replies to a comment will be returned
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { lastLikesCount, lastCommentID } = req.query;

  // If we have a lastLikesCount and lastCommentID, we'll use them for pagination.
  const likesCount = lastLikesCount ? Number(lastLikesCount) : Infinity;
  const commentID = lastCommentID ? Number(lastCommentID) : Infinity;
  try {
    const comments = await prisma.$queryRaw(
      Prisma.sql`${getTop10CommentsFromPostQuery}`,
      id,
      likesCount,
      commentID
    );
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching comments for post",
    });
  }
});

// delete comment
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedComment = await prisma.comment.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(deletedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error deleting comment: ${id}`,
    });
  }
});

export default router;
