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

// report a comment
router.post("/:id/report", async (req, res) => {
  console.log("report comment called");
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  try {
    const newReport = await prisma.reported_comments.create({
      data: {
        user_id_reporting: currentUser.id,
        comment_id: Number(id),
      },
    });

    res.status(200).json(newReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error reporting the comment." });
  }
});

// delete comment
router.delete("/:id", async (req, res) => {
  console.log("delete comment called");
  const { id } = req.params;
  const { postID } = req.query;
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  try {
    // query for the comment
    const comment = await prisma.comments.findUnique({
      where: {
        id: Number(id),
      },
    });

    // ensure user is the author of the comment
    if (comment && comment.user_id !== currentUser.id) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    // we have to delete the foreign key constraints first
    await prisma.comment_likes.deleteMany({
      where: {
        comment_id: Number(id),
      },
    });

    await prisma.reported_comments.deleteMany({
      where: {
        comment_id: Number(id),
      },
    });

    const [_, deletedComment] = await prisma.$transaction([
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
    const createLike = prisma.comment_likes.create({
      data: {
        user_id: currentUser.id,
        comment_id: Number(id),
      },
    });

    const incrementLikes = prisma.comments.update({
      where: { id: Number(id) },
      data: {
        likes_count: {
          increment: 1,
        },
      },
    });

    const [newLike, updatedComment] = await prisma.$transaction([
      createLike,
      incrementLikes,
    ]);

    res.status(200).json({ newLike, updatedComment });
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
    const deleteLike = prisma.comment_likes.delete({
      where: {
        user_id_comment_id: {
          user_id: currentUser.id,
          comment_id: Number(id),
        },
      },
    });

    const decrementLikes = prisma.comments.update({
      where: { id: Number(id) },
      data: {
        likes_count: {
          decrement: 1,
        },
      },
    });

    const [newUnlike, updatedComment] = await prisma.$transaction([
      deleteLike,
      decrementLikes,
    ]);

    res.status(200).json({ newUnlike, updatedComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error unliking comment" });
  }
});

export default router;
