import { Prisma } from "@prisma/client";

export const getPostsByUserAndPostIdsQuery = (
  userID: string,
  postIds: number[] // array of post IDs
) => {
  // Convert array of post IDs into a comma-separated string
  const postIdsString = postIds.join(", ");

  return Prisma.sql`
              SELECT 
                  posts.*, 
                  users.username, 
                  users.image AS profile_image,
                  CASE WHEN post_likes.id IS NOT NULL AND post_likes.is_dislike IS FALSE THEN TRUE ELSE FALSE END AS liked_by_user,
                  CASE WHEN post_likes.id IS NOT NULL AND post_likes.is_dislike IS TRUE THEN TRUE ELSE FALSE END AS disliked_by_user
              FROM 
                  posts
              INNER JOIN 
                  users ON posts.user_id = users.id
              LEFT JOIN 
                  post_likes ON posts.id = post_likes.post_id AND post_likes.user_id = ${userID}
              WHERE 
                  posts.id IN (${Prisma.raw(postIdsString)})
              LIMIT 20;
          `;
};

export const getPostsByUserAndNeighborhoodQuery = (
  userID: string,
  neighborhoodID: number,
  lastPostId: number // cursor
) => {
  return Prisma.sql`
            SELECT 
                posts.*, 
                users.username, 
                users.image AS profile_image,
                CASE WHEN post_likes.id IS NOT NULL AND post_likes.is_dislike IS FALSE THEN TRUE ELSE FALSE END AS liked_by_user,
                CASE WHEN post_likes.id IS NOT NULL AND post_likes.is_dislike IS TRUE THEN TRUE ELSE FALSE END AS disliked_by_user
            FROM 
                posts
            INNER JOIN 
                users ON posts.user_id = users.id
            LEFT JOIN 
                post_likes ON posts.id = post_likes.post_id AND post_likes.user_id = ${userID}
            WHERE 
                posts.neighborhood_id = ${neighborhoodID} AND posts.id < ${lastPostId}
            ORDER BY 
                posts.id DESC
            LIMIT 20;
        `;
};

export const getSinglePostQuery = (userID: string, postID: number) => {
  return Prisma.sql`
                SELECT 
                    posts.*, 
                    users.username, 
                    users.image AS profile_image,
                    CASE WHEN post_likes.id IS NOT NULL AND post_likes.is_dislike IS FALSE THEN TRUE ELSE FALSE END AS liked_by_user,
                    CASE WHEN post_likes.id IS NOT NULL AND post_likes.is_dislike IS TRUE THEN TRUE ELSE FALSE END AS disliked_by_user
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
export const createPostQuery = (
  userID: string,
  neighborhoodID: number,
  textContent: string,
  imageURL: string,
  imageWidth: number,
  imageHeight: number
) => {
  return Prisma.sql`
                WITH new_post AS (
                    INSERT INTO posts (user_id, neighborhood_id, text_content, image_url, image_width, image_height)
                    VALUES (${userID}, ${neighborhoodID}, ${textContent}, ${imageURL}, ${imageWidth}, ${imageHeight})
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

export const getPostsByUserQuery = (
  userID: string,
  currentUserID: string,
  lastPostId: number // cursor
) => {
  return Prisma.sql`
            SELECT 
                posts.*, 
                users.username, 
                users.image AS profile_image,
                CASE WHEN post_likes.id IS NOT NULL AND post_likes.is_dislike IS FALSE THEN TRUE ELSE FALSE END AS liked_by_user,
                CASE WHEN post_likes.id IS NOT NULL AND post_likes.is_dislike IS TRUE THEN TRUE ELSE FALSE END AS disliked_by_user
            FROM 
                posts 
            INNER JOIN 
                users ON posts.user_id = users.id
            LEFT JOIN 
                post_likes ON posts.id = post_likes.post_id AND post_likes.user_id = ${currentUserID} 
            WHERE 
                posts.user_id = ${userID} AND posts.id < ${lastPostId}
            ORDER BY 
                posts.created_at DESC 
            LIMIT 10;
        `;
};
