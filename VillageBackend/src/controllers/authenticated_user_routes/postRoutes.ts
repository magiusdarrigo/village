import { Router } from "express";
import prisma from "../../clients/prismaClient";
import { getTop10CommentsFromPostQuery } from "../../sql_queries/comments";
import { getNumberFromQuery } from "../../utils/casting";
import { AuthenticatedRequest } from "../../middleware/auth";
import { getSinglePostQuery, createPostQuery } from "../../sql_queries/posts";
import { postTextContentAllowed } from "../../utils/badwords";
import { upload } from "../../middleware/upload";
import {
  uploadImageToSupabase,
  convertFileIfNecessary,
  deleteFileFromFS,
} from "../../utils/uploads";

const router = Router();
const MAX_SIGNED_FOUR_BYTE_INT = 2147483647;

// report a post
router.post("/:id/report", async (req, res) => {
  console.log("report post called");
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  try {
    const newReport = await prisma.reported_posts.create({
      data: {
        user_id_reporting: currentUser.id,
        post_id: Number(id),
      },
    });

    res.status(200).json(newReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error reporting the post." });
  }
});

// delete post
router.delete("/:id", async (req, res) => {
  console.log("delete post called");
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  try {
    // query for the post
    const post = await prisma.posts.findUnique({
      where: {
        id: Number(id),
      },
    });
    // ensure user is the author of the post
    if (post && post.user_id !== currentUser.id) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    const deletePost = await prisma.posts.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json(deletePost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting the post." });
  }
});

// create post
router.post("/", upload.single("image"), async (req, res) => {
  console.log("create post called");
  const { neighborhoodID, textContent } = req.body;
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  if (textContent && !postTextContentAllowed(textContent)) {
    return res
      .status(400)
      .json({ error: "That post's content is not allowed." });
  }

  // first try-catch is for image upload handling
  let uploadedFilePath = "";
  try {
    if (req.file) {
      await convertFileIfNecessary(req.file);
      // upload file to supabase
      uploadedFilePath = await uploadImageToSupabase(
        req.file,
        String(currentUser.id)
      );
      // delete the file from the local filesystem
      await deleteFileFromFS(req.file.path);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error uploading image for user`,
    });
  }
  // second try-catch is for post creation
  try {
    const newPostQuery = createPostQuery(
      currentUser.id,
      Number(neighborhoodID),
      textContent,
      uploadedFilePath
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

// get post
router.get("/:id", async (req, res) => {
  console.log("get post called");
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  try {
    const getPostQuery = getSinglePostQuery(currentUser.id, Number(id));
    const posts = (await prisma.$queryRaw(getPostQuery)) as any[];

    if (posts.length !== 1) {
      return res.status(404).json({ error: "post not found" });
    }

    res.json(posts[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error fetching post: ${id}`,
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
  console.log("get comments called");
  const { id } = req.params;
  let lastLikesCount = getNumberFromQuery(req.query.lastLikesCount);
  let lastCommentID = getNumberFromQuery(req.query.lastCommentID);
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const postID = getNumberFromQuery(id);

  if (!postID) {
    return res.status(400).json({ error: "id is required" });
  }

  lastLikesCount =
    lastLikesCount || lastLikesCount === 0
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
    const comments = (await prisma.$queryRaw(getCommentsQuery)) as any[];
    // we need to make sure to only count comments and not replies for these
    const parentComments = comments.filter(
      (comment) => comment.parent_comment_id === null
    );
    const newLastLikesCount =
      parentComments.length === 10
        ? String(parentComments[9].likes_count)
        : undefined;
    const newLastCommentID =
      parentComments.length === 10 ? String(parentComments[9].id) : undefined;
    res.json({
      data: comments,
      lastLikesCount: newLastLikesCount,
      lastCommentID: newLastCommentID,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching comments for post",
    });
  }
});

// like a post
router.post("/:id/likes", async (req, res) => {
  console.log("like a post called");
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

    res.status(200).json({ newLike, updatedPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error liking the post." });
  }
});

// unlike a post
router.delete("/:id/likes", async (req, res) => {
  console.log("unlike a post called");
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

    const [newUnlike, updatedPost] = await prisma.$transaction([
      deleteLike,
      decrementLikes,
    ]);

    res.status(200).json({ newUnlike, updatedPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error unliking the post." });
  }
});

export default router;
