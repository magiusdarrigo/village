import { Prisma } from "@prisma/client";

export const getTop10CommentsFromPostQuery = (
  postID: number,
  userID: number,
  lastLikesCount: number,
  lastCommentID: number
) => {
  return Prisma.sql`
    SELECT 
        c.*,
        r.*,
        CASE WHEN cl.id IS NOT NULL THEN TRUE ELSE FALSE END AS liked_by_user
    FROM 
        comments c
    LEFT JOIN 
        comments r ON c.id = r.parent_comment_id
    LEFT JOIN
        comment_likes cl ON (c.id = cl.comment_id OR r.id = cl.comment_id) AND cl.user_id = ${userID}
    WHERE 
        c.post_id = ${postID} AND 
        c.parent_comment_id IS NULL 
        
    ORDER BY 
        c.likes_count DESC, c.id DESC
    LIMIT 10;
`;
};

// AND (c.likes_count, c.id) < (${lastLikesCount}, ${lastCommentID})
