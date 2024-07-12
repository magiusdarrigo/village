import express from "express";
import prisma from "../../clients/prismaClient";
import { createPostAdminQuery } from "../../sql_queries/posts";
import { upload } from "../../middleware/upload";
import sharp from "sharp";
import {
  uploadImageToSupabase,
  convertFileIfNecessary,
  deleteFileFromFS,
} from "../../utils/uploads";

const router = express.Router();

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

// create post for any user
router.post("/", upload.single("image"), async (req, res) => {
  console.log("create admin post called");
  const { neighborhoodID, textContent, username, createdAt, likesCount } =
    req.body;

  let imageWidth;
  let imageHeight;
  if (req.file) {
    console.log("req.file", req.file);
    const image = sharp(req.file.path);
    const metadata = await image.metadata();
    imageWidth = metadata.width;
    imageHeight = metadata.height;
  }
  console.log("imageWidth", imageWidth);

  // get the user ID from the username
  const user = await prisma.users.findFirst({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      error: `user not found with username ${username}`,
    });
  }

  const userID = user.id;

  // first try-catch is for image upload handling
  let uploadedFilePath = "";
  try {
    if (req.file) {
      await convertFileIfNecessary(req.file);
      // upload file to supabase
      uploadedFilePath = await uploadImageToSupabase(
        req.file,
        userID,
        "post_images",
        "uploads",
        800
      );
      // delete the file from the local filesystem
      await deleteFileFromFS(req.file.path);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: `error uploading image for user`,
    });
  }

  // second try-catch is for post creation
  try {
    const newPostQuery = createPostAdminQuery(
      userID,
      Number(neighborhoodID),
      textContent,
      uploadedFilePath,
      imageWidth ? Number(imageWidth) : 0,
      imageHeight ? Number(imageHeight) : 0,
      createdAt,
      likesCount ? Number(likesCount) : 0
    );
    const newPost = (await prisma.$queryRaw(newPostQuery)) as any[];

    if (newPost.length !== 1) {
      return res.status(500).json({ error: "error creating post" });
    }

    res.json(newPost[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error creating post for user`,
    });
  }
});

export default router;
