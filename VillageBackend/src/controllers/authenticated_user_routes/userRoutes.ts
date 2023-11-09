import { Router } from "express";
import prisma from "../../clients/prismaClient";
import { getPostsByUserQuery } from "../../sql_queries/posts";
import { getNumberFromQuery } from "../../utils/casting";
import { AuthenticatedRequest } from "../../middleware/auth";
import { usernameAllowed } from "../../utils/badwords";

const router = Router();

// update user profile
router.put("/", async (req, res) => {
  console.log("update user profile called");
  // we won't use the request parameter for the user id. We will get the user id from the token
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  // get the attributes that can be updated from the request body
  let { username, profileImage, buildingID, neighborhoodID } = req.body;
  // ensure username is not racist
  if (username && !usernameAllowed(username)) {
    return res.status(400).json({
      error: "That username is not allowed.",
    });
  }
  // change buildingID and neighborhoodID to numbers
  buildingID = buildingID ? Number(buildingID) : null;
  neighborhoodID = neighborhoodID ? Number(neighborhoodID) : null;
  try {
    const updatedUser = await prisma.users.update({
      where: {
        id: currentUser.id,
      },
      data: {
        username,
        image: profileImage,
        building_id: buildingID,
        neighborhood_id: neighborhoodID,
      },
    });
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

// // update user profile (has custom image)
// router.put("/upload", async (req, res) => {
//   // we won't use the request parameter for the user id. We will get the user id from the token
//   const currentUser = (req as unknown as AuthenticatedRequest).user;

//   try {
//     // Upload the file to Supabase Storage
//     const { data, error } = await supabase.storage
//       .from("avatars")
//       .upload(`profiles/${file.originalname}`, file.stream);

//     if (error) {
//       throw error;
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: "error updating user",
//     });
//   }
// });

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

    await prisma.$transaction([
      createFollowing,
      incrementFollowingCount,
      incrementFollowersCount,
    ]);

    res.status(200).json({ message: "Successfully followed the user." });
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

    await prisma.$transaction([
      deleteFollowing,
      decrementFollowingCount,
      decrementFollowersCount,
    ]);

    res.status(200).json({ message: "Successfully unfollowed the user." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error unfollowing the user." });
  }
});

// get one user
// only select the fields we need: id, username, image, is_verified, followers_count, following_count
router.get("/:id", async (req, res) => {
  console.log("get one user called");
  const { id } = req.params;
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        username: true,
        image: true,
        is_verified: true,
        followers_count: true,
        following_count: true,
      },
    });
    res.json(user);
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
  const currentUser = (req as unknown as AuthenticatedRequest).user;
  const cursor = getNumberFromQuery(req.query.cursor) || 0;

  try {
    const getPostsSqlQuery = getPostsByUserQuery(currentUser.id, cursor);
    const posts = await prisma.$queryRaw(getPostsSqlQuery);

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "error fetching posts for profile",
    });
  }
});

export default router;
