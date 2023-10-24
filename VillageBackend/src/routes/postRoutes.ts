import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

// create post
router.post("/", async (req, res) => {
  const { userID, neighborhoodID, textContent, imageURL } = req.body;
  try {
    const newPost = await prisma.post.create({
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
router.get("/neighborhood/:neighborhoodID", async (req, res) => {
  const { neighborhoodID } = req.params;
  const { cursor } = req.query;
  try {
    const posts = await prisma.post.findMany({
      where: {
        neighborhoodID: Number(neighborhoodID),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: Number(cursor) } : undefined,
    });
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
router.get("/user/:userID", async (req, res) => {
  const { userID } = req.params;
  const { cursor } = req.query;
  try {
    const posts = await prisma.post.findMany({
      where: {
        userID: Number(userID),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: Number(cursor) } : undefined,
    });
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
    const updatedPost = await prisma.post.update({
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
    const deletedPost = await prisma.post.delete({
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

export default router;
