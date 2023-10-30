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
// create building
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address } = req.body;
    try {
        // TODO: find the neighborhood that the building resides in based on the address.
        // below is a temporary solution
        const neighborhoodID = 1; // connecting to UES neighborhood ID
        const newBuilding = yield prismaClient_1.default.buildings.create({
            data: {
                address,
                neighborhood_id: neighborhoodID,
            },
        });
        res.json(newBuilding);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error creating building with address ${address}`,
        });
    }
}));
// update building
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { address } = req.body;
    try {
        // TODO: find the neighborhood that the building resides in based on the address.
        // below is a temporary solution
        const neighborhoodID = 1; // connecting to UES neighborhood ID
        const updatedBuilding = yield prismaClient_1.default.buildings.update({
            where: {
                id: Number(id),
            },
            data: {
                address,
                neighborhood_id: neighborhoodID,
            },
        });
        res.json(updatedBuilding);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error updating building: ${id}`,
        });
    }
}));
// list buildings
router.get("/", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const buildings = yield prismaClient_1.default.buildings.findMany();
        res.json(buildings);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "error fetching buildings",
        });
    }
}));
// get one building
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const building = yield prismaClient_1.default.buildings.findUnique({
            where: {
                id: Number(id),
            },
        });
        res.json(building);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error fetching building: ${id}`,
        });
    }
}));
// delete building
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedBuilding = yield prismaClient_1.default.buildings.delete({
            where: {
                id: Number(id),
            },
        });
        res.json(deletedBuilding);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: `error deleting building: ${id}`,
        });
    }
}));
exports.default = router;
