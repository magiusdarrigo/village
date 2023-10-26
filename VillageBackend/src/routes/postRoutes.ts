import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

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
