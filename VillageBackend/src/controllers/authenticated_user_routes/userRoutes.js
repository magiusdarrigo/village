"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../../clients/prismaClient"));
const posts_1 = require("../../sql_queries/posts");
const casting_1 = require("../../utils/casting");
const router = (0, express_1.Router)();
// create user
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, phoneNumber } = req.body;
    try {
        const newUser = yield prismaClient_1.default.users.create({
            data: {
                username,
                phone_number: phoneNumber,
            },
        });
        res.json(newUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error creating user with username ${username} and phone number ${phoneNumber}`,
        });
    }
}));
// update user
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { image, isVerified, neighborhoodID, buildingID, followersCount, followingCount, } = req.body;
    try {
        const updatedUser = yield prismaClient_1.default.users.update({
            where: {
                id: Number(id),
            },
            data: {
                image,
                is_verified: isVerified,
                neighborhood_id: neighborhoodID,
                building_id: buildingID,
                followers_count: followersCount,
                following_count: followingCount,
            },
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error updating user: ${id}`,
        });
    }
}));
// list users
router.get("/", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsers = yield prismaClient_1.default.users.findMany();
        res.json(allUsers);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error listing users`,
        });
    }
}));
// get one user
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prismaClient_1.default.users.findUnique({
            where: {
                id: Number(id),
            },
        });
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error getting user: ${id}`,
        });
    }
}));
// delete user
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedUser = yield prismaClient_1.default.users.delete({
            where: {
                id: Number(id),
            },
        });
        res.json(deletedUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error deleting user: ${id}`,
        });
    }
}));
// follow a user
router.post("/:id/follow", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // the id of the user who is following
    const currentUser = req.user;
    try {
        const createFollowing = prismaClient_1.default.user_following.create({
            data: {
                follower_user_id: currentUser.id,
                following_user_id: Number(id),
            },
        });
        const incrementFollowingCount = prismaClient_1.default.users.update({
            where: { id: currentUser.id },
            data: { following_count: { increment: 1 } },
        });
        const incrementFollowersCount = prismaClient_1.default.users.update({
            where: { id: Number(id) },
            data: { followers_count: { increment: 1 } },
        });
        yield prismaClient_1.default.$transaction([
            createFollowing,
            incrementFollowingCount,
            incrementFollowersCount,
        ]);
        res.status(200).json({ message: "Successfully followed the user." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error following the user." });
    }
}));
// unfollow a user
router.delete("/:id/follow", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // the id of the user who is unfollowing
    const currentUser = req.user;
    try {
        const deleteFollowing = prismaClient_1.default.user_following.deleteMany({
            where: {
                follower_user_id: currentUser.id,
                following_user_id: Number(id),
            },
        });
        const decrementFollowingCount = prismaClient_1.default.users.update({
            where: { id: currentUser.id },
            data: { following_count: { decrement: 1 } },
        });
        const decrementFollowersCount = prismaClient_1.default.users.update({
            where: { id: Number(id) },
            data: { followers_count: { decrement: 1 } },
        });
        yield prismaClient_1.default.$transaction([
            deleteFollowing,
            decrementFollowingCount,
            decrementFollowersCount,
        ]);
        res.status(200).json({ message: "Successfully unfollowed the user." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error unfollowing the user." });
    }
}));
/**
 * get posts by user id
 * order by createdAt descending
 * paginate by 10 for infinite scroll on the frontend
 */
router.get("/:id/posts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const currentUser = req.user;
    const cursor = (0, casting_1.getNumberFromQuery)(req.query.cursor) || 0;
    try {
        const getPostsSqlQuery = (0, posts_1.getPostsByUserQuery)(currentUser.id, cursor);
        const posts = yield prismaClient_1.default.$queryRaw(getPostsSqlQuery);
        res.json(posts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "error fetching posts for profile",
        });
    }
}));
exports.default = router;
