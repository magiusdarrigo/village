import { Router } from "express";
import prisma from "../../clients/prismaClient";
import { getPostsByUserQuery } from "../../sql_queries/posts";
import { getNumberFromQuery } from "../../utils/casting";
import { AuthenticatedRequest } from "../../middleware/auth";
import { usernameAllowed } from "../../utils/badwords";
import { getUserProfileQuery } from "../../sql_queries/users";
import { getNotificationsByUserQuery } from "../../sql_queries/notifications";
import streamChatClient from "../../clients/streamChatClient";
import { sendNotification } from "../../clients/firebaseClient";
import { upload } from "../../middleware/upload";
import { MAX_INT4_VALUE } from "../../utils/constants";
import {
  uploadImageToSupabase,
  convertFileIfNecessary,
  deleteFileFromFS,
} from "../../utils/uploads";

const router = Router();

// update user profile
router.put("/", upload.single("image"), async (req, res) => {
  console.log("update user profile called");
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  // get the attributes that can be updated from the request body
  let {
    username,
    buildingID,
    neighborhoodID,
    defaultImage,
    fcmToken,
    selectedNeighborhoods,
  } = req.body;
  // ensure username is not racist
  if (username && !usernameAllowed(username)) {
    return res.status(400).json({
      error: "That username is not allowed.",
    });
  }

  // first try-catch is for image upload handling
  let uploadedFilePath = "";
  try {
    if (req.file) {
      await convertFileIfNecessary(req.file);
      // upload file to supabase
      uploadedFilePath = await uploadImageToSupabase(
        req.file,
        String(currentUser.id),
        "profile_pictures",
        "uploads"
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

  uploadedFilePath = uploadedFilePath || defaultImage;

  // change buildingID and neighborhoodID to numbers
  buildingID = buildingID ? Number(buildingID) : undefined;
  neighborhoodID = neighborhoodID ? Number(neighborhoodID) : undefined;
  // change selectedNeighborhoods to an array of objects
  selectedNeighborhoods = selectedNeighborhoods
    ? JSON.parse(selectedNeighborhoods)
    : undefined;
  try {
    const updatedUser = await prisma.users.update({
      where: {
        id: currentUser.id,
      },
      data: {
        username,
        image: uploadedFilePath,
        building_id: buildingID,
        neighborhood_id: neighborhoodID,
        fcm_token: fcmToken,
        selected_neighborhoods: selectedNeighborhoods,
      },
      select: {
        id: true,
        username: true,
        image: true,
        is_verified: true,
        followers_count: true,
        following_count: true,
        neighborhood_id: true,
        building_id: true,
        chat_token: true,
        blocked_users: true,
        selected_neighborhoods: true,
        neighborhood: {
          select: {
            name: true,
          },
        },
        building: {
          select: {
            address: true,
          },
        },
      },
    });
    // if buildingID was updated, add the user to the building chat
    if (buildingID) {
      const _id = String(buildingID);
      const channels = await streamChatClient.queryChannels({
        id: { $eq: _id },
      });
      const channel = channels[0];
      // create user in stream chat
      await streamChatClient.upsertUser({
        id: updatedUser.id.toString(),
        role: "user",
        name: updatedUser.username,
        image: updatedUser.image,
      });
      await channel.addMembers([updatedUser.id.toString()]);
      // send a message to the building chat that the user joined
      await channel.sendMessage({
        text: `${updatedUser.username} joined the building chat.`,
        user_id: "village-app",
      });
      // TODO: remove user from old building chat
    }
    res.json(updatedUser);
  } catch (error: any) {
    console.error(error);
    // if the username is already taken, return a 400
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "That username is already taken.",
      });
    }
    res.status(500).json({
      error: "error updating user",
    });
  }
});

// follow a user
router.post("/:id/follow", async (req, res) => {
  console.log("follow user called");
  const { id } = req.params;
  // the id of the user who is following
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  try {
    const createFollowing = prisma.user_following.create({
      data: {
        follower_user_id: currentUser.id,
        following_user_id: id,
      },
    });

    const incrementFollowingCount = prisma.users.update({
      where: { id: currentUser.id },
      data: { following_count: { increment: 1 } },
    });

    const incrementFollowersCount = prisma.users.update({
      where: { id },
      data: { followers_count: { increment: 1 } },
      select: {
        id: true,
        username: true,
        image: true,
        is_verified: true,
        followers_count: true,
        fcm_token: true,
        following_count: true,
        neighborhood_id: true,
        building_id: true,
        neighborhood: {
          select: {
            name: true,
          },
        },
      },
    });

    const [_, __, followedUser] = await prisma.$transaction([
      createFollowing,
      incrementFollowingCount,
      incrementFollowersCount,
    ]);

    // return the followedUser object but without the fcm_token
    res.status(200).json({
      ...followedUser,
      fcm_token: undefined,
    });

    // send a notification to the user being followed
    // get current user's username
    const currentUserData = await prisma.users.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        username: true,
      },
    });
    const title = "You've got a new follower";
    const message = `@${currentUserData?.username} is now following you.`;
    // create a notification record
    await prisma.notifications.create({
      data: {
        title,
        message,
        for_user_id: id,
        from_user_id: currentUser.id,
      },
    });
    // send a push notification
    if (followedUser?.fcm_token) {
      await sendNotification(title, message, followedUser.fcm_token);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error following the user." });
  }
});

// unfollow a user
router.delete("/:id/follow", async (req, res) => {
  console.log("unfollow user called");
  const { id } = req.params;
  // the id of the user who is unfollowing
  const currentUser = (req as unknown as AuthenticatedRequest).user;

  try {
    const deleteFollowing = prisma.user_following.deleteMany({
      where: {
        follower_user_id: currentUser.id,
        following_user_id: id,
      },
    });

    const decrementFollowingCount = prisma.users.update({
      where: { id: currentUser.id },
      data: { following_count: { decrement: 1 } },
    });

    const decrementFollowersCount = prisma.users.update({
      where: { id },
      data: { followers_count: { decrement: 1 } },
      select: {
        id: true,
        username: true,
        image: true,
        is_verified: true,
        followers_count: true,
        fcm_token: true,
        following_count: true,
        neighborhood_id: true,
        building_id: true,
        neighborhood: {
          select: {
            name: true,
          },
        },
      },
    });

    const [_, __, user] = await prisma.$transaction([
      deleteFollowing,
      decrementFollowingCount,
      decrementFollowersCount,
    ]);

    res.status(200).json({
      ...user,
      fcm_token: undefined,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error unfollowing the user." });
  }
});

// get one user
router.get("/:id", async (req, res) => {
  console.log("get user called, by id: ", req.params.id);
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  try {
    const getUserQuery = getUserProfileQuery(currentUser.id, id);
    const user = (await prisma.$queryRaw(getUserQuery)) as any[];

    if (user.length !== 1) {
      console.log("user not found");
      return res.status(404).json({ error: "user not found" });
    }

    // move the neighborhood_name key to be { neighborhood: { name: neighborhood_name } }
    user[0].neighborhood = { name: user[0].neighborhood_name };
    delete user[0].neighborhood_name;

    res.json(user[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `error getting user: ${id}`,
    });
  }
});

// get the current user
router.get("/", async (req, res) => {
  console.log("get current user called");
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        id: true,
        username: true,
        image: true,
        is_verified: true,
        followers_count: true,
        following_count: true,
        neighborhood_id: true,
        blocked_users: true,
        building_id: true,
        chat_token: true,
        selected_neighborhoods: true,
        neighborhood: {
          select: {
            name: true,
          },
        },
        building: {
          select: {
            address: true,
          },
        },
      },
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error getting current user",
    });
  }
});

/**
 * get posts by user id
 * order by createdAt descending
 * paginate by 10 for infinite scroll on the frontend
 */
router.get("/:id/posts", async (req, res) => {
  console.log("get posts by user id called, user_id: ", req.params.id);
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const currentUserID = currentUser.id;
  const userID = id;
  const cursor = getNumberFromQuery(req.query.cursor) || MAX_INT4_VALUE;

  if (!userID) {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    const getPostsSqlQuery = getPostsByUserQuery(userID, currentUserID, cursor);
    const posts = (await prisma.$queryRaw(getPostsSqlQuery)) as any;

    const nextCursor = posts.length < 10 ? undefined : posts[9].id;

    res.json({ data: posts, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching posts for profile",
    });
  }
});

/**
 * get notifications for user
 * order by createdAt descending
 * paginate by 10 for infinite scroll on the frontend
 */
router.get("/:id/notifications", async (req, res) => {
  console.log("get notifications by user id called, id: ", req.params.id);
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const currentUserID = currentUser.id;
  const userID = id;
  const cursor = getNumberFromQuery(req.query.cursor) || MAX_INT4_VALUE;

  if (!userID) {
    return res.status(400).json({ error: "id is required" });
  }

  if (currentUserID !== userID) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const getNotificationsSqlQuery = getNotificationsByUserQuery(
      currentUserID,
      cursor
    );
    const notifications = (await prisma.$queryRaw(
      getNotificationsSqlQuery
    )) as any;

    const nextCursor =
      notifications.length < 10 ? undefined : notifications[9].id;

    res.json({ data: notifications, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching notifications for user",
    });
  }
});

/**
 * update notifications for user.
 */
router.put("/:id/notifications", async (req, res) => {
  console.log("update notifications by user id called, id: ", req.params.id);
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const currentUserID = currentUser.id;
  const userID = id;
  const notificationIds = req.body.notificationIDs;
  const read = req.body.read;

  if (!userID) {
    return res.status(400).json({ error: "id is required" });
  }

  if (currentUserID !== userID) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    await prisma.notifications.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        read,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error updating notifications for user",
    });
  }
});

/**
 * Account deletion request by user
 */
router.delete("/", async (req, res) => {
  console.log("delete user called");
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  try {
    // if an account_deletion_requests with the same phone_number exists, delete it
    await prisma.account_deletion_requests.deleteMany({
      where: {
        phone_number: currentUser.phone,
      },
    });

    // get user
    const user = await prisma.users.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        building_id: true,
        username: true,
      },
    });

    if (!user || !user.building_id) {
      return res.status(404).json({ error: "user or building id not found" });
    }

    await prisma.account_deletion_requests.create({
      data: {
        user_id: currentUser.id,
        username: user.username,
        phone_number: currentUser.phone,
        building_id: user?.building_id,
      },
    });
    console.log("user delete request processed: ", currentUser.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error deleting user account",
    });
  }
});

/**
 * Block user request by user
 */
router.post("/:id/block", async (req, res) => {
  console.log("block user called");
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const targetUserID = id;
  if (!targetUserID) {
    return res.status(400).json({ error: "id is required" });
  }
  try {
    await prisma.users.update({
      where: {
        id: currentUser.id,
      },
      data: {
        blocked_users: {
          push: targetUserID,
        },
      },
    });

    // TODO: (Make this an asynchronous task) add blocked user ID to the "hidden_from_users" array for all posts by the current user
    await prisma.posts.updateMany({
      where: {
        user_id: currentUser.id,
      },
      data: {
        hidden_from_users: {
          push: targetUserID,
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error blocking user",
    });
  }
});

export default router;
