import { Router } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prismaClient";
import { getTop10CommentsFromPostQuery } from "../sql_queries/comments";

const router = Router();

// create comment
router.post("/", async (req, res) => {
  const { userID, postID, textContent, parentCommentID } = req.body;
  try {
    const newComment = await prisma.comments.create({
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

  let updateData: any = {
    textContent,
  };

  if (likesCount === 1 || likesCount === -1) {
    updateData.likesCount = {
      increment: likesCount,
    };
  } else if (likesCount && likesCount !== 1 && likesCount !== -1) {
    // If likesCount is provided but is not +1 or -1, set it directly
    updateData.likesCount = likesCount;
  }

  try {
    const updatedComment = await prisma.comments.update({
      where: {
        id: Number(id),
      },
      data: updateData,
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
 * determine if each comment has been liked by a user
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { lastLikesCount, lastCommentID, userID } = req.query;

  if (!userID) {
    return res
      .status(400)
      .json({ error: "userID is required to determine comment likes." });
  }

  // If we have a lastLikesCount and lastCommentID, we'll use them for pagination.
  const likesCount = lastLikesCount ? Number(lastLikesCount) : Infinity;
  const commentID = lastCommentID ? Number(lastCommentID) : Infinity;

  try {
    const comments = await prisma.$queryRaw(
      Prisma.sql`${getTop10CommentsFromPostQuery}`,
      id,
      likesCount,
      commentID,
      userID
    );
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching comments for post",
    });
  }
});

// get comment by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await prisma.comments.findUnique({
      where: {
        id: Number(id),
      },
    });
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error fetching comment: ${id}`,
    });
  }
});

// delete comment
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedComment = await prisma.comments.delete({
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

// like a comment
router.post("/:id/likes", async (req, res) => {
  // the comment id
  const { id } = req.params;
  const { userID } = req.body;
  try {
    await prisma.$transaction([
      prisma.comments.update({
        where: { id: Number(id) },
        data: { likesCount: { increment: 1 } },
      }),
      prisma.comment_likes.create({
        data: {
          userID,
          commentID: Number(id),
        },
      }),
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error liking comment" });
  }
});

// unlike a comment
router.delete("/:id/likes", async (req, res) => {
  // the comment id
  const { id } = req.params;
  const { userID } = req.body;
  try {
    await prisma.$transaction([
      prisma.comments.update({
        where: { id: Number(id) },
        data: { likesCount: { decrement: 1 } },
      }),
      prisma.comment_likes.deleteMany({
        where: {
          userID,
          commentID: Number(id),
        },
      }),
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error unliking comment" });
  }
});

export default router;
