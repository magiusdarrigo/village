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
const twilioClient_1 = __importDefault(require("../../clients/twilioClient"));
const router = (0, express_1.Router)();
const jwt = require("jsonwebtoken");
// new phone number not seen before -> create new user
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
        return res.status(400).send("Phone number is required.");
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // generates a 6-digit code
    try {
        // check if phone number exists in users table
        const user = yield prismaClient_1.default.users.findUnique({
            where: {
                phone_number: phoneNumber,
            },
        });
        // if phone number exists, then the user is logging in. update the user's otp
        if (user) {
            yield prismaClient_1.default.users.update({
                where: {
                    phone_number: phoneNumber,
                },
                data: {
                    otp,
                },
            });
        }
        else {
            // if phone number does not exist, then the user is signing up. create a new user
            const username = Math.random().toString(36).substring(2, 5) +
                Math.random().toString(36).substring(2, 12);
            yield prismaClient_1.default.users.create({
                data: {
                    username,
                    phone_number: phoneNumber,
                    otp,
                },
            });
        }
        // Send OTP using Twilio
        yield twilioClient_1.default.messages.create({
            body: `Your Village OTP is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });
        res.send("OTP sent successfully.");
    }
    catch (error) {
        console.error("Error in login handler:", error);
        res.status(500).send("Internal Server Error.");
    }
}));
router.post("/validate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const phoneNumber = req.body.phone_number;
    const userOTP = req.body.otp;
    if (!phoneNumber || !userOTP) {
        return res.status(400).send("Phone number and OTP are required.");
    }
    try {
        // Fetch the OTP from the database for the given phone number
        const result = yield prismaClient_1.default.users.findUnique({
            where: {
                phone_number: phoneNumber,
            },
            select: {
                otp: true,
                id: true,
            },
        });
        const storedOTP = result === null || result === void 0 ? void 0 : result.otp;
        const userID = result === null || result === void 0 ? void 0 : result.id;
        if (!storedOTP) {
            return res.status(404).send("User not found.");
        }
        if (storedOTP !== userOTP) {
            return res.status(400).send("Invalid OTP.");
        }
        // If the OTP is valid, generate a JWT and send it back
        const token = jwt.sign({ role: "user", phone: phoneNumber, userID }, process.env.JWT_SECRET);
        // invalidate/delete the OTP from the database after successful verification
        yield prismaClient_1.default.users.update({
            where: {
                phone_number: phoneNumber,
            },
            data: {
                otp: null,
            },
        });
        res.json({ token }); // Send the JWT to the client
    }
    catch (error) {
        console.error("Error in validate handler:", error);
        res.status(500).send("Internal Server Error.");
    }
}));
exports.default = router;
