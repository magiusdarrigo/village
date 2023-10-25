import { Router } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prismaClient";
import {
  get20NewestPostsForTimelineQuery,
  getPostsByUserQuery,
} from "../sql_queries/posts";

const router = Router();

// create post
router.post("/", async (req, res) => {
  const { userID, neighborhoodID, textContent, imageURL } = req.body;
  try {
    const newPost = await prisma.posts.create({
      data: {
        userID,
        neighborhoodID,
        textContent,
        imageURL,
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

/**
 * get posts by neighborhood id
 * order by createdAt descending
 * paginate by 20 for infinite scroll on the frontend
 */
router.get("/", async (req, res) => {
  const { neighborhoodID, userID, cursor } = req.query;

  if (!neighborhoodID) {
    return res.status(400).json({ error: "neighborhoodID is required" });
  }

  if (!userID) {
    return res
      .status(400)
      .json({ error: "userId is required to determine post likes." });
  }

  try {
    const posts = await prisma.$queryRawUnsafe(
      get20NewestPostsForTimelineQuery,
      userID,
      neighborhoodID,
      cursor
    );

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching posts for timeline",
    });
  }
});

/**
 * get posts by user id
 * order by createdAt descending
 * paginate by 10 for infinite scroll on the frontend
 */
router.get("/", async (req, res) => {
  const { userID, cursor } = req.query;

  if (!userID) {
    return res.status(400).json({ error: "userID is required" });
  }

  try {
    const posts = await prisma.$queryRaw(
      Prisma.sql`${getPostsByUserQuery}`,
      userID,
      cursor ? 1 : 0
    );

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching posts for profile",
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
        textContent,
        imageURL,
        likesCount,
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

// like a post
router.post("/:id/likes", async (req, res) => {
  const { id } = req.params;
  const userID = req.body.userID; // assuming the user ID is sent in the request body

  try {
    const createLike = prisma.post_likes.create({
      data: {
        userID,
        postID: Number(id),
      },
    });

    const incrementLikes = prisma.posts.update({
      where: { id: Number(id) },
      data: {
        likesCount: {
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
        userID_postID: {
          userID,
          postID: Number(id),
        },
      },
    });

    const decrementLikes = prisma.posts.update({
      where: { id: Number(id) },
      data: {
        likesCount: {
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
