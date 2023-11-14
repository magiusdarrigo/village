import { Prisma } from "@prisma/client";

export const getTop10CommentsFromPostQuery = (
  postID: number,
  userID: number,
  lastLikesCount: number,
  lastCommentID: number
) => {
  return Prisma.sql`
    WITH TopComments AS (
      SELECT 
          c.id,
          c.post_id,
          c.user_id,
          c.text_content,
          c.likes_count,
          c.created_at,
          c.tags,
          c.parent_comment_id,
          u.username,
          u.image AS profile_image,
          CASE WHEN cl.id IS NOT NULL THEN TRUE ELSE FALSE END AS liked_by_user
      FROM 
          comments c
      LEFT JOIN
          comment_likes cl ON c.id = cl.comment_id AND cl.user_id = ${userID}
      LEFT JOIN
          users u ON c.user_id = u.id
      WHERE 
          c.post_id = ${postID} AND 
          c.parent_comment_id IS NULL AND
          (c.likes_count, c.id) < (${lastLikesCount}, ${lastCommentID})
      ORDER BY 
          c.likes_count DESC, c.id DESC
      LIMIT 10
  )
  
  SELECT 
      * 
  FROM 
      TopComments
  
  UNION ALL
  
  SELECT 
      r.id,
      r.post_id,
      r.user_id,
      r.text_content,
      r.likes_count,
      r.created_at,
      r.tags,
      r.parent_comment_id,
      u.username,
      u.image AS profile_image,
      CASE WHEN cl.id IS NOT NULL THEN TRUE ELSE FALSE END AS liked_by_user
  FROM 
      comments r
  LEFT JOIN
      comment_likes cl ON r.id = cl.comment_id AND cl.user_id = ${userID}
  LEFT JOIN
      users u ON r.user_id = u.id
  WHERE 
      r.parent_comment_id IN (SELECT id FROM TopComments)
  
  ORDER BY likes_count ASC, id DESC;
  `;
};

export const createCommentQuery = (
  userID: number,
  postID: number,
  textContent: string,
  parentCommentID: number | null
) => {
  return Prisma.sql`
    BEGIN;

    -- Update the posts table
    UPDATE posts
    SET comments_count = comments_count + 1
    WHERE id = ${postID};
    
    -- Insert a new comment into the comments table and join with the users table
    WITH new_comment AS (
        INSERT INTO comments (user_id, post_id, text_content, parent_comment_id)
        VALUES (${userID}, ${postID}, ${textContent}, ${parentCommentID})
        RETURNING id, user_id, post_id, text_content, parent_comment_id, created_at
    )
    SELECT 
        nc.id, 
        nc.user_id, 
        nc.post_id, 
        nc.text_content, 
        nc.parent_comment_id, 
        nc.created_at,
        u.username,
        u.image AS profile_image
    FROM 
        new_comment nc
    JOIN 
        users u ON nc.user_id = u.id;
    
  COMMIT;
    `;
};
