import { Router } from "express";
import prisma from "../../clients/prismaClient";
import { AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// create comment
router.post("/", async (req, res) => {
  const { postID, textContent, parentCommentID } = req.body;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  try {
    const newComment = await prisma.comments.create({
      data: {
        user_id: currentUser.id,
        post_id: postID,
        text_content: textContent,
        parent_comment_id: parentCommentID,
      },
    });
    res.json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error creating comment from user.`,
    });
  }
});

// delete comment (if the user is the owner of the comment)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  try {
    const deletedComment = await prisma.comments.delete({
      where: {
        id: Number(id),
        user_id: currentUser.id,
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
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  try {
    await prisma.$transaction([
      prisma.comments.update({
        where: { id: Number(id) },
        data: { likes_count: { increment: 1 } },
      }),
      prisma.comment_likes.create({
        data: {
          user_id: currentUser.id,
          comment_id: Number(id),
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
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  try {
    await prisma.$transaction([
      prisma.comments.update({
        where: { id: Number(id) },
        data: { likes_count: { decrement: 1 } },
      }),
      prisma.comment_likes.deleteMany({
        where: {
          user_id: currentUser.id,
          comment_id: Number(id),
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
