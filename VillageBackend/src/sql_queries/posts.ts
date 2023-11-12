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

// return the post as well as the user's username and profile image
export const createPostOnlyTextQuery = (
  userID: number,
  neighborhoodID: number,
  textContent: string
) => {
  return Prisma.sql`
                WITH new_post AS (
                    INSERT INTO posts (user_id, neighborhood_id, text_content)
                    VALUES (${userID}, ${neighborhoodID}, ${textContent})
                    RETURNING *
                )
                SELECT 
                    new_post.*,
                    u.username,
                    u.image AS profile_image
                FROM 
                    new_post
                JOIN 
                    users u ON new_post.user_id = u.id;
            `;
};

// return the post as well as the user's username and profile image
export const createPostWithTextAndImageQuery = (
  userID: number,
  neighborhoodID: number,
  textContent: string,
  imageURL: string
) => {
  return Prisma.sql`
                  WITH new_post AS (
                      INSERT INTO posts (user_id, neighborhood_id, text_content, image_url)
                      VALUES (${userID}, ${neighborhoodID}, ${textContent}, ${imageURL})
                      RETURNING *
                  )
                  SELECT 
                      new_post.*,
                      u.username,
                      u.image AS profile_image
                  FROM 
                      new_post
                  JOIN 
                      users u ON new_post.user_id = u.id;
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
