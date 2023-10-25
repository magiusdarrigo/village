export const getTop10CommentsFromPostQuery = `
    SELECT 
        c.*,
        r.*,
        CASE WHEN cl.id IS NOT NULL THEN TRUE ELSE FALSE END AS likedByUser
    FROM 
        comments c
    LEFT JOIN 
        comments r ON c.id = r.parentCommentID
    LEFT JOIN
        comment_likes cl ON (c.id = cl.commentID OR r.id = cl.commentID) AND cl.userID = $4
    WHERE 
        c.postID = $1 AND 
        c.parentCommentID IS NULL AND 
        (c.likesCount, c.id) < ($2, $3) -- Cursor-based pagination condition
    ORDER BY 
        c.likesCount DESC, c.id DESC
    LIMIT 10;
`;
