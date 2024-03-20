import { Router } from "express";
import prisma from "../../clients/prismaClient";
import { AuthenticatedRequest } from "../../middleware/auth";
import { commentTextContentAllowed } from "../../utils/badwords";
import { sendNotification } from "../../clients/firebaseClient";
import { truncateNotificationMessage } from "../../utils/truncate";

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
          likes_count: true,
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

    res.json(updatedNewComment);

    // send a notification to the post author if the comment is not a reply, else send a notification to the parent comment author
    let targetUserID;
    let targetFCMToken;
    if (parentCommentID) {
      const parentComment = await prisma.comments.findUnique({
        where: {
          id: Number(parentCommentID),
        },
        select: {
          user_id: true,
          user: {
            select: {
              fcm_token: true,
            },
          },
        },
      });
      targetUserID = parentComment?.user_id;
      targetFCMToken = parentComment?.user.fcm_token;
    } else {
      const post = await prisma.posts.findUnique({
        where: {
          id: Number(postID),
        },
        select: {
          user_id: true,
          user: {
            select: {
              fcm_token: true,
            },
          },
        },
      });
      targetUserID = post?.user_id;
      targetFCMToken = post?.user.fcm_token;
    }

    if (!targetUserID || targetUserID === currentUser.id) {
      return;
    }

    // send a notification to the comment author
    let title;
    if (parentCommentID) {
      title = `@${updatedNewComment.username} replied to your comment`;
    } else {
      title = `@${updatedNewComment.username} commented on your post`;
    }
    const message = truncateNotificationMessage(newComment.text_content ?? "");

    // create a notification record
    await prisma.notifications.create({
      data: {
        title,
        message,
        for_user_id: targetUserID,
        from_user_id: currentUser.id,
        for_comment_id: newComment.id,
        for_post_id: newComment.post_id,
      },
    });
    // send a push notification
    if (targetFCMToken) {
      await sendNotification(title, message, targetFCMToken);
    }
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

// +1 on either a comment's thumbs up or thumbs down
router.post("/:id/likes", async (req, res) => {
  console.log("+1 on either a comment's thumbs up or thumbs down, called");
  const { id } = req.params;
  const { is_dislike } = req.query;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  try {
    const createLike = prisma.comment_likes.create({
      data: {
        user_id: currentUser.id,
        comment_id: Number(id),
        is_dislike: is_dislike === "true",
      },
    });

    const changeLikes = prisma.comments.update({
      where: { id: Number(id) },
      data: {
        likes_count: {
          increment: (is_dislike === "true" ? -1 : 1) as number,
        },
      },
    });

    const [newLike, updatedComment] = await prisma.$transaction([
      createLike,
      changeLikes,
    ]);

    res.status(200).json({ newLike, updatedComment });

    // if the comment was liked, send a notification to the comment author
    if (is_dislike === "true") {
      return;
    }
    // query for the comment author
    const commentAuthor = await prisma.users.findUnique({
      where: {
        id: updatedComment.user_id,
      },
      select: {
        id: true,
        fcm_token: true,
      },
    });

    // if the comment author is the current user, don't send a notification
    if (commentAuthor?.id === currentUser.id) {
      return;
    }

    // query for the current user
    const currentUserData = await prisma.users.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        username: true,
      },
    });

    // send a notification to the comment author
    let title;
    if (updatedComment.parent_comment_id) {
      title = `@${currentUserData?.username} liked your comment`;
    } else {
      title = `@${currentUserData?.username} liked your reply`;
    }
    const message = truncateNotificationMessage(
      updatedComment.text_content ?? ""
    );

    // create a notification record
    await prisma.notifications.create({
      data: {
        title,
        message,
        for_user_id: updatedComment.user_id,
        from_user_id: currentUser.id,
        for_comment_id: Number(id),
        for_post_id: updatedComment.post_id,
      },
    });
    // send a push notification
    if (commentAuthor?.fcm_token) {
      await sendNotification(title, message, commentAuthor.fcm_token);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error liking comment" });
  }
});

// -1 on either a comment's thumbs up or thumbs down
router.delete("/:id/likes", async (req, res) => {
  console.log("-1 on either a comment's thumbs up or thumbs down, called");
  const { id } = req.params;
  const { is_dislike } = req.query;
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

    const changeLikes = prisma.comments.update({
      where: { id: Number(id) },
      data: {
        likes_count: {
          decrement: (is_dislike === "true" ? -1 : 1) as number,
        },
      },
    });

    const [newUnlike, updatedComment] = await prisma.$transaction([
      deleteLike,
      changeLikes,
    ]);

    res.status(200).json({ newUnlike, updatedComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error unliking comment" });
  }
});

export default router;
