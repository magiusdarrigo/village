import { Prisma } from "@prisma/client";

export const getPostsByUserAndNeighborhoodQuery = (
  userID: number,
  neighborhoodID: number,
  cursor: number
) => {
  return Prisma.sql`
            SELECT 
                posts.*, 
                users.username, 
                users.image AS profile_image,
                CASE WHEN post_likes.id IS NOT NULL THEN TRUE ELSE FALSE END AS liked_by_user 
            FROM 
                posts
            INNER JOIN 
                users ON posts.user_id = users.id
            LEFT JOIN 
                post_likes ON posts.id = post_likes.post_id AND post_likes.user_id = ${userID}
            WHERE 
                posts.neighborhood_id = ${neighborhoodID}
            ORDER BY 
                posts.created_at DESC 
            LIMIT 20 OFFSET ${cursor};
        `;
};

export const getSinglePostQuery = (userID: number, postID: number) => {
  return Prisma.sql`
                SELECT 
                    posts.*, 
                    users.username, 
                    users.image AS profile_image,
                    CASE WHEN post_likes.id IS NOT NULL THEN TRUE ELSE FALSE END AS liked_by_user 
                FROM 
                    posts
                INNER JOIN 
                    users ON posts.user_id = users.id
                LEFT JOIN 
                    post_likes ON posts.id = post_likes.post_id AND post_likes.user_id = ${userID}
                WHERE 
                    posts.id = ${postID};
            `;
};

export const getPostsByUserQuery = (userID: number, cursor: number) => {
  return Prisma.sql`
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
