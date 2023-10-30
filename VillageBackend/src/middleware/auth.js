"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
function isUserData(obj) {
    return (obj &&
        typeof obj.role === "string" &&
        typeof obj.phone === "string" &&
        typeof obj.id === "number");
}
const authenticateToken = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    // If there's no token, return an error
    if (!token)
        return res.status(401).send("Access Denied: No Token Provided!");
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (isUserData(payload)) {
            // Add user data to the request
            req.user = payload;
            next();
        }
        else {
            res.status(403).send("Access Denied: Invalid Token Structure!");
        }
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.JsonWebTokenError ||
            error instanceof jsonwebtoken_1.NotBeforeError ||
            error instanceof jsonwebtoken_1.TokenExpiredError) {
            res.status(403).send("Access Denied: Invalid Token!");
        }
        else {
            res.status(500).send("Internal Server Error.");
        }
    }
};
exports.default = authenticateToken;
