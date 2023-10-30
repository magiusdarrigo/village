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
const comments_1 = require("../../sql_queries/comments");
const casting_1 = require("../../utils/casting");
const router = (0, express_1.Router)();
const MAX_SIGNED_FOUR_BYTE_INT = 2147483647;
// create post
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { neighborhoodID, textContent, imageURL } = req.body;
    const currentUser = req.user;
    try {
        const newPost = yield prismaClient_1.default.posts.create({
            data: {
                user_id: currentUser.id,
                neighborhood_id: neighborhoodID,
                text_content: textContent,
                image_url: imageURL,
            },
        });
        res.json(newPost);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error creating post for user`,
        });
    }
}));
// get post
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const post = yield prismaClient_1.default.posts.findUnique({
            where: {
                id: Number(id),
            },
        });
        res.json(post);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error fetching post: ${id}`,
        });
    }
}));
// update post
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { textContent, imageURL, likesCount } = req.body;
    try {
        const updatedPost = yield prismaClient_1.default.posts.update({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error updating post: ${id}`,
        });
    }
}));
// delete post
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedPost = yield prismaClient_1.default.posts.delete({
            where: {
                id: Number(id),
            },
        });
        res.json(deletedPost);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error deleting post: ${id}`,
        });
    }
}));
/**
 * get comments by post id
 * order comments by likesCount descending
 * paginate by 10 for infinite scroll on the frontend
 * all replies to a comment will be returned
 * determine if each comment has been liked by a user
 */
router.get("/:id/comments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    let lastLikesCount = (0, casting_1.getNumberFromQuery)(req.query.lastLikesCount);
    let lastCommentID = (0, casting_1.getNumberFromQuery)(req.query.lastCommentID);
    const currentUser = req.user;
    const postID = (0, casting_1.getNumberFromQuery)(id);
    if (!postID) {
        return res.status(400).json({ error: "id is required" });
    }
    // If we have a lastLikesCount and lastCommentID, we'll use them for pagination.
    lastLikesCount = lastLikesCount
        ? Number(lastLikesCount)
        : MAX_SIGNED_FOUR_BYTE_INT;
    lastCommentID = lastCommentID
        ? Number(lastCommentID)
        : MAX_SIGNED_FOUR_BYTE_INT;
    try {
        const getCommentsQuery = (0, comments_1.getTop10CommentsFromPostQuery)(postID, currentUser.id, lastLikesCount, lastCommentID);
        const comments = yield prismaClient_1.default.$queryRaw(getCommentsQuery);
        res.json(comments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "error fetching comments for post",
        });
    }
}));
// like a post
router.post("/:id/likes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const currentUser = req.user;
    try {
        const createLike = prismaClient_1.default.post_likes.create({
            data: {
                user_id: currentUser.id,
                post_id: Number(id),
            },
        });
        const incrementLikes = prismaClient_1.default.posts.update({
            where: { id: Number(id) },
            data: {
                likes_count: {
                    increment: 1,
                },
            },
        });
        const [newLike, updatedPost] = yield prismaClient_1.default.$transaction([
            createLike,
            incrementLikes,
        ]);
        res.status(201).json({ newLike, updatedPost });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error liking the post." });
    }
}));
// unlike a post
router.delete("/:id/likes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const currentUser = req.user;
    try {
        const deleteLike = prismaClient_1.default.post_likes.delete({
            where: {
                user_id_post_id: {
                    user_id: currentUser.id,
                    post_id: Number(id),
                },
            },
        });
        const decrementLikes = prismaClient_1.default.posts.update({
            where: { id: Number(id) },
            data: {
                likes_count: {
                    decrement: 1,
                },
            },
        });
        yield prismaClient_1.default.$transaction([deleteLike, decrementLikes]);
        res.status(204).send({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error unliking the post." });
    }
}));
exports.default = router;
