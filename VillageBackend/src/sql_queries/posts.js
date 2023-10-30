"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsByUserQuery = exports.getPostsByUserAndNeighborhoodQuery = void 0;
const client_1 = require("@prisma/client");
const getPostsByUserAndNeighborhoodQuery = (userID, neighborhoodID, cursor) => {
    return client_1.Prisma.sql `
            SELECT 
                posts.*, 
                CASE WHEN post_likes.id IS NOT NULL THEN TRUE ELSE FALSE END AS liked_by_user 
            FROM 
                posts
            LEFT JOIN 
                post_likes ON posts.id = post_likes.post_id AND post_likes.user_id = ${userID}
            WHERE 
                posts.neighborhood_id = ${neighborhoodID}
            ORDER BY 
                posts.created_at DESC 
            LIMIT 20 OFFSET ${cursor};
        `;
};
exports.getPostsByUserAndNeighborhoodQuery = getPostsByUserAndNeighborhoodQuery;
const getPostsByUserQuery = (userID, cursor) => {
    return client_1.Prisma.sql `
            SELECT 
                posts.*, 
                CASE WHEN post_likes.id IS NOT NULL THEN TRUE ELSE FALSE END AS liked_by_user 
            FROM 
                posts 
            LEFT JOIN 
                post_likes ON posts.id = post_likes.post_id AND post_likes.user_id = ${userID} 
            WHERE 
                posts.user_id = ${userID} 
            ORDER BY 
                posts.created_at DESC 
            LIMIT 10 OFFSET ${cursor};
        `;
};
exports.getPostsByUserQuery = getPostsByUserQuery;
