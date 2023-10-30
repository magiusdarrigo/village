"use strict";
/**
 * THIS ROUTER IS UNDER CONSTRUCTION
 * TODO: ADD REALTIME STREAMING FOR CHAT MESSAGES
 */
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
// create chat message
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID, buildingID, textContent, tags } = req.body;
    try {
        const newMessage = yield prismaClient_1.default.chat_messages.create({
            data: {
                user_id: userID,
                building_id: buildingID,
                text_content: textContent,
                tags,
            },
        });
        res.json(newMessage);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error creating chat message from user: ${userID}`,
        });
    }
}));
// get chat messages by building id
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { buildingID } = req.query;
    if (!buildingID) {
        return res.status(400).json({ error: "buildingID is required" });
    }
    try {
        const messages = yield prismaClient_1.default.chat_messages.findMany({
            where: {
                building_id: Number(buildingID),
            },
            orderBy: {
                created_at: "desc",
            },
        });
        res.json(messages);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "error fetching chat messages for building",
        });
    }
}));
// update chat message
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { textContent, tags } = req.body;
    try {
        const updatedMessage = yield prismaClient_1.default.chat_messages.update({
            where: {
                id: Number(id),
            },
            data: {
                text_content: textContent,
                tags,
            },
        });
        res.json(updatedMessage);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error updating chat message: ${id}`,
        });
    }
}));
// delete chat message
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedMessage = yield prismaClient_1.default.chat_messages.delete({
            where: {
                id: Number(id),
            },
        });
        res.json(deletedMessage);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error deleting chat message: ${id}`,
        });
    }
}));
exports.default = router;
