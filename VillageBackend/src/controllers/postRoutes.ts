import { Router } from "express";
import prisma from "../prismaClient";
import { getTop10CommentsFromPostQuery } from "../sql_queries/comments";
import { getNumberFromQuery } from "../utils/casting";

const router = Router();

const MAX_SIGNED_FOUR_BYTE_INT = 2147483647;

// create post
router.post("/", async (req, res) => {
  const { userID, neighborhoodID, textContent, imageURL } = req.body;
  try {
    const newPost = await prisma.posts.create({
      data: {
        user_id: userID,
        neighborhood_id: neighborhoodID,
        text_content: textContent,
        image_url: imageURL,
      },
    });
    res.json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error creating post from user: ${userID}`,
    });
  }
});

// update post
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { textContent, imageURL, likesCount } = req.body;

  try {
    const updatedPost = await prisma.posts.update({
      where: {
        id: Number(id),
      },
      data: {
        text_content: textContent,
        image_url: imageURL,
        likes_count: likesCount,
      },
    });
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error updating post: ${id}`,
    });
  }
});

// delete post
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPost = await prisma.posts.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(deletedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error deleting post: ${id}`,
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
  const userID = getNumberFromQuery(req.query.userID);
  const postID = getNumberFromQuery(id);

  if (!postID) {
    return res.status(400).json({ error: "id is required" });
  }

  if (!userID) {
    return res
      .status(400)
      .json({ error: "userID is required to determine comment likes." });
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
      userID,
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
  const userID = req.body.userID; // assuming the user ID is sent in the request body

  try {
    const createLike = prisma.post_likes.create({
      data: {
        user_id: userID,
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
  const userID = req.body.userID; // assuming the user ID is sent in the request body

  try {
    const deleteLike = prisma.post_likes.delete({
      where: {
        user_id_post_id: {
          user_id: userID,
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

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error unliking the post." });
  }
});

export default router;
