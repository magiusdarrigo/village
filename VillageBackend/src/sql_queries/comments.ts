export const getTop10CommentsFromPostQuery = `
    SELECT 
        c.*,
        r.*,
        CASE WHEN cl.id IS NOT NULL THEN TRUE ELSE FALSE END AS liked_by_user
    FROM 
        comments c
    LEFT JOIN 
        comments r ON c.id = r.parent_comment_id
    LEFT JOIN
        comment_likes cl ON (c.id = cl.comment_id OR r.id = cl.comment_id) AND cl.user_id = $4
    WHERE 
        c.post_id = $1 AND 
        c.parent_comment_id IS NULL AND 
        (c.likes_count, c.id) < ($2, $3) -- Cursor-based pagination condition
    ORDER BY 
        c.likes_count DESC, c.id DESC
    LIMIT 10;
`;
