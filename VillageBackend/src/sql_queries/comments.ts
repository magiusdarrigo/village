export const getTop10CommentsFromPostQuery = `
    SELECT 
        c.*,
        r.*
    FROM 
        Comment c
    LEFT JOIN 
        Comment r ON c.id = r.parentCommentID
    WHERE 
        c.postID = $1 AND 
        c.parentCommentID IS NULL AND 
        (c.likesCount, c.id) < ($2, $3) -- Cursor-based pagination condition
    ORDER BY 
        c.likesCount DESC, c.id DESC
    LIMIT 10;
`;
