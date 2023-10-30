import { Router } from "express";
import prisma from "../../clients/prismaClient";

const router = Router();

// get comment
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

export default router;
