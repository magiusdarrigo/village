import { Router } from "express";
import prisma from "../../clients/prismaClient";
import { getPostsByUserQuery } from "../../sql_queries/posts";
import { getNumberFromQuery } from "../../utils/casting";
import { AuthenticatedRequest } from "../../middleware/auth";
import { usernameAllowed } from "../../utils/badwords";
import { getUserProfileQuery } from "../../sql_queries/users";
import streamChatClient from "../../clients/streamChatClient";
import { upload } from "../../middleware/upload";
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
  let { username, buildingID, neighborhoodID, defaultImage } = req.body;
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
    res.status(500).json({
      error: `error uploading image for user`,
    });
  }

  uploadedFilePath = uploadedFilePath || defaultImage;

  // change buildingID and neighborhoodID to numbers
  buildingID = buildingID ? Number(buildingID) : undefined;
  neighborhoodID = neighborhoodID ? Number(neighborhoodID) : undefined;
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
        following_user_id: Number(id),
      },
    });

    const incrementFollowingCount = prisma.users.update({
      where: { id: currentUser.id },
      data: { following_count: { increment: 1 } },
    });

    const incrementFollowersCount = prisma.users.update({
      where: { id: Number(id) },
      data: { followers_count: { increment: 1 } },
    });

    const [userFollowing, _, user] = await prisma.$transaction([
      createFollowing,
      incrementFollowingCount,
      incrementFollowersCount,
    ]);

    res.status(200).json(user);
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
        following_user_id: Number(id),
      },
    });

    const decrementFollowingCount = prisma.users.update({
      where: { id: currentUser.id },
      data: { following_count: { decrement: 1 } },
    });

    const decrementFollowersCount = prisma.users.update({
      where: { id: Number(id) },
      data: { followers_count: { decrement: 1 } },
    });

    const [userFollowing, _, user] = await prisma.$transaction([
      deleteFollowing,
      decrementFollowingCount,
      decrementFollowersCount,
    ]);

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error unfollowing the user." });
  }
});

// get one user
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  try {
    const getUserQuery = getUserProfileQuery(currentUser.id, Number(id));
    const user = (await prisma.$queryRaw(getUserQuery)) as any[];

    if (user.length !== 1) {
      return res.status(404).json({ error: "user not found" });
    }

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
        building_id: true,
        chat_token: true,
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
  console.log("get posts by user id called, id: ", req.params.id);
  const { id } = req.params;
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const currentUserID = currentUser.id;
  const userID = getNumberFromQuery(id);
  const cursor = getNumberFromQuery(req.query.cursor) || 0;

  if (!userID) {
    return res.status(400).json({ error: "id is required" });
  }

  try {
    const getPostsSqlQuery = getPostsByUserQuery(userID, currentUserID, cursor);
    const posts = (await prisma.$queryRaw(getPostsSqlQuery)) as any;

    const nextCursor = posts.length < 10 ? undefined : cursor + 10;

    res.json({ data: posts, nextCursor });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching posts for profile",
    });
  }
});

export default router;
