import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

// create comment
router.post("/", async (req, res) => {
  const { userID, postID, textContent, parentCommentID } = req.body;
  try {
    const newComment = await prisma.comments.create({
      data: {
        user_id: userID,
        post_id: postID,
        text_content: textContent,
        parent_comment_id: parentCommentID,
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
        data: { likes_count: { increment: 1 } },
      }),
      prisma.comment_likes.create({
        data: {
          user_id: userID,
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
  const { userID } = req.body;
  try {
    await prisma.$transaction([
      prisma.comments.update({
        where: { id: Number(id) },
        data: { likes_count: { decrement: 1 } },
      }),
      prisma.comment_likes.deleteMany({
        where: {
          user_id: userID,
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
