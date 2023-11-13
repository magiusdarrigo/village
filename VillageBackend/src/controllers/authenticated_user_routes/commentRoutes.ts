import { Router } from "express";
import prisma from "../../clients/prismaClient";
import { AuthenticatedRequest } from "../../middleware/auth";
import { commentTextContentAllowed } from "../../utils/badwords";
import { createCommentQuery } from "../../sql_queries/comments";

const router = Router();

// create comment
router.post("/", async (req, res) => {
  console.log("create comment called");
  const { postID, textContent, parentCommentID } = req.body;
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  if (textContent && !commentTextContentAllowed(textContent)) {
    return res
      .status(400)
      .json({ error: "That comment's content is not allowed." });
  }

  try {
    const newComment = await prisma.$transaction(async (prisma) => {
      await prisma.posts.update({
        where: { id: Number(postID) },
        data: { comments_count: { increment: 1 } },
      });
      return await prisma.comments.create({
        data: {
          user_id: currentUser.id,
          post_id: Number(postID),
          text_content: textContent,
          parent_comment_id: parentCommentID ? Number(parentCommentID) : null,
        },
        select: {
          id: true,
          user_id: true,
          post_id: true,
          text_content: true,
          parent_comment_id: true,
          created_at: true,
          user: {
            select: {
              username: true,
              image: true,
            },
          },
        },
      });
    });

    const updatedNewComment: any = newComment;
    updatedNewComment.username = newComment.user.username;
    updatedNewComment.profile_image = newComment.user.image;

    // const newCommentQuery = createCommentQuery(
    //   currentUser.id,
    //   postID,
    //   textContent,
    //   parentCommentID
    // );
    // const newComment = (await prisma.$queryRaw(newCommentQuery)) as any[];

    // if (newComment.length !== 1) {
    //   return res.status(500).json({ error: "error creating comment" });
    // }

    res.json(updatedNewComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error creating comment from user.`,
    });
  }
});

// delete comment (if the user is the owner of the comment)
router.delete("/:id", async (req, res) => {
  console.log("delete comment called");
  const { id } = req.params;
  const { postID } = req.body;
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  try {
    const deletedComment = await prisma.$transaction([
      prisma.posts.update({
        where: { id: Number(postID) },
        data: { comments_count: { decrement: 1 } },
      }),
      prisma.comments.delete({
        where: {
          id: Number(id),
        },
        select: {
          id: true,
          user_id: true,
          post_id: true,
          text_content: true,
          parent_comment_id: true,
          created_at: true,
        },
      }),
    ]);
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
  console.log("like a comment called");
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
  console.log("unlike a comment called");
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
