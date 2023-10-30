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
const router = (0, express_1.Router)();
// create comment
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postID, textContent, parentCommentID } = req.body;
    const currentUser = req.user;
    try {
        const newComment = yield prismaClient_1.default.comments.create({
            data: {
                user_id: currentUser.id,
                post_id: postID,
                text_content: textContent,
                parent_comment_id: parentCommentID,
            },
        });
        res.json(newComment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error creating comment from user.`,
        });
    }
}));
// update comment
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { textContent, likesCount } = req.body;
    let updateData = {
        textContent,
    };
    if (likesCount === 1 || likesCount === -1) {
        updateData.likesCount = {
            increment: likesCount,
        };
    }
    else if (likesCount && likesCount !== 1 && likesCount !== -1) {
        // If likesCount is provided but is not +1 or -1, set it directly
        updateData.likesCount = likesCount;
    }
    try {
        const updatedComment = yield prismaClient_1.default.comments.update({
            where: {
                id: Number(id),
            },
            data: updateData,
        });
        res.json(updatedComment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error updating comment: ${id}`,
        });
    }
}));
// get comment
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const comment = yield prismaClient_1.default.comments.findUnique({
            where: {
                id: Number(id),
            },
        });
        res.json(comment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error fetching comment: ${id}`,
        });
    }
}));
// delete comment
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedComment = yield prismaClient_1.default.comments.delete({
            where: {
                id: Number(id),
            },
        });
        res.json(deletedComment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error deleting comment: ${id}`,
        });
    }
}));
// like a comment
router.post("/:id/likes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // the comment id
    const { id } = req.params;
    const { userID } = req.body;
    try {
        yield prismaClient_1.default.$transaction([
            prismaClient_1.default.comments.update({
                where: { id: Number(id) },
                data: { likes_count: { increment: 1 } },
            }),
            prismaClient_1.default.comment_likes.create({
                data: {
                    user_id: userID,
                    comment_id: Number(id),
                },
            }),
        ]);
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error liking comment" });
    }
}));
// unlike a comment
router.delete("/:id/likes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // the comment id
    const { id } = req.params;
    const currentUser = req.user;
    try {
        yield prismaClient_1.default.$transaction([
            prismaClient_1.default.comments.update({
                where: { id: Number(id) },
                data: { likes_count: { decrement: 1 } },
            }),
            prismaClient_1.default.comment_likes.deleteMany({
                where: {
                    user_id: currentUser.id,
                    comment_id: Number(id),
                },
            }),
        ]);
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error unliking comment" });
    }
}));
exports.default = router;
