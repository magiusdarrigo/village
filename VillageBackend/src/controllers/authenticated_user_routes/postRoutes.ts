import { Router } from "express";
import prisma from "../../clients/prismaClient";
import { getTop10CommentsFromPostQuery } from "../../sql_queries/comments";
import { getNumberFromQuery } from "../../utils/casting";
import { AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

const MAX_SIGNED_FOUR_BYTE_INT = 2147483647;

// create post
router.post("/", async (req, res) => {
  const { neighborhoodID, textContent, imageURL } = req.body;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  try {
    const newPost = await prisma.posts.create({
      data: {
        user_id: currentUser.id,
        neighborhood_id: neighborhoodID,
        text_content: textContent,
        image_url: imageURL,
      },
    });
    res.json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error creating post for user`,
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
router.get("/:id/comments", async (req, res) => {
  const { id } = req.params;
  let lastLikesCount = getNumberFromQuery(req.query.lastLikesCount);
  let lastCommentID = getNumberFromQuery(req.query.lastCommentID);
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const postID = getNumberFromQuery(id);

  if (!postID) {
    return res.status(400).json({ error: "id is required" });
  }

  // If we have a lastLikesCount and lastCommentID, we'll use them for pagination.
  lastLikesCount = lastLikesCount
    ? Number(lastLikesCount)
    : MAX_SIGNED_FOUR_BYTE_INT;
  lastCommentID = lastCommentID
    ? Number(lastCommentID)
    : MAX_SIGNED_FOUR_BYTE_INT;

  try {
    const getCommentsQuery = getTop10CommentsFromPostQuery(
      postID,
      currentUser.id,
      lastLikesCount,
      lastCommentID
    );
    const comments = await prisma.$queryRaw(getCommentsQuery);

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching comments for post",
    });
  }
});

// like a post
router.post("/:id/likes", async (req, res) => {
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  try {
    const createLike = prisma.post_likes.create({
      data: {
        user_id: currentUser.id,
        post_id: Number(id),
      },
    });

    const incrementLikes = prisma.posts.update({
      where: { id: Number(id) },
      data: {
        likes_count: {
          increment: 1,
        },
      },
    });

    const [newLike, updatedPost] = await prisma.$transaction([
      createLike,
      incrementLikes,
    ]);

    res.status(201).json({ newLike, updatedPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error liking the post." });
  }
});

// unlike a post
router.delete("/:id/likes", async (req, res) => {
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  try {
    const deleteLike = prisma.post_likes.delete({
      where: {
        user_id_post_id: {
          user_id: currentUser.id,
          post_id: Number(id),
        },
      },
    });

    const decrementLikes = prisma.posts.update({
      where: { id: Number(id) },
      data: {
        likes_count: {
          decrement: 1,
        },
      },
    });

    await prisma.$transaction([deleteLike, decrementLikes]);

    res.status(204).send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error unliking the post." });
  }
});

export default router;
