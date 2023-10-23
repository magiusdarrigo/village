import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

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

// // list post
// router.get("/:id", (req, res) => {
//   const { id } = req.params;
//   res.status(501).json({ error: `get tweet ${id} not implemented` });
// });

// // delete post
// router.delete("/:id", (req, res) => {
//   const { id } = req.params;
//   res.status(501).json({ error: `delete tweet ${id} not implemented` });
// });

export default router;
