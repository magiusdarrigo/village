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
// create neighborhood
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    try {
        const newNeighborhood = yield prismaClient_1.default.neighborhoods.create({
            data: {
                name,
            },
        });
        res.json(newNeighborhood);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error creating neighborhood with name ${name}`,
        });
    }
}));
// update neighborhood
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const updatedNeighborhood = yield prismaClient_1.default.neighborhoods.update({
            where: {
                id: Number(id),
            },
            data: {
                name,
            },
        });
        res.json(updatedNeighborhood);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error updating neighborhood: ${id}`,
        });
    }
}));
// list neighborhoods
router.get("/", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const neighborhoods = yield prismaClient_1.default.neighborhoods.findMany();
        res.json(neighborhoods);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "error fetching neighborhoods",
        });
    }
}));
// get one neighborhood
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const neighborhood = yield prismaClient_1.default.neighborhoods.findUnique({
            where: {
                id: Number(id),
            },
        });
        res.json(neighborhood);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error fetching neighborhood: ${id}`,
        });
    }
}));
// delete neighborhood
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedNeighborhood = yield prismaClient_1.default.neighborhoods.delete({
            where: {
                id: Number(id),
            },
        });
        res.json(deletedNeighborhood);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error deleting neighborhood: ${id}`,
        });
    }
}));
/**
 * get posts by neighborhood id
 * order by createdAt descending
 * paginate by 20 for infinite scroll on the frontend
 */
router.get("/:id/posts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const currentUser = req.user;
    const neighborhoodID = (0, casting_1.getNumberFromQuery)(id);
    const cursor = (0, casting_1.getNumberFromQuery)(req.query.cursor) || 0;
    if (!neighborhoodID) {
        return res.status(400).json({ error: "id is required" });
    }
    try {
        const getPostsSqlQuery = (0, posts_1.getPostsByUserAndNeighborhoodQuery)(currentUser.id, neighborhoodID, cursor);
        const posts = yield prismaClient_1.default.$queryRaw(getPostsSqlQuery);
        res.json(posts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "error fetching posts for timeline",
        });
    }
}));
exports.default = router;
