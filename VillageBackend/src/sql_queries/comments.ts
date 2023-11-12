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
        CASE WHEN cl.id IS NOT NULL THEN TRUE ELSE FALSE END AS liked_by_user
    FROM 
        comments c
    LEFT JOIN
        comment_likes cl ON c.id = cl.comment_id AND cl.user_id = ${userID}
    WHERE 
        c.post_id = ${postID} AND 
        c.parent_comment_id IS NULL AND
        (c.likes_count, c.id) < (${lastLikesCount}, ${lastCommentID}) -- Cursor-based condition
    ORDER BY 
        c.likes_count DESC, c.id DESC
    LIMIT 10
)

SELECT * FROM TopComments

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
    CASE WHEN cl.id IS NOT NULL THEN TRUE ELSE FALSE END AS liked_by_user
FROM 
    comments r
LEFT JOIN
    comment_likes cl ON r.id = cl.comment_id AND cl.user_id = ${userID}
WHERE 
    r.parent_comment_id IN (SELECT id FROM TopComments)
ORDER BY likes_count DESC, id DESC;
`;
};
