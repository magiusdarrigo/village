export const get20NewestPostsForTimelineQuery = `
SELECT 
    posts.*, 
    CASE WHEN post_likes.id IS NOT NULL THEN TRUE ELSE FALSE END AS liked_by_user 
FROM 
    posts
LEFT JOIN 
    post_likes ON posts.id = post_likes.post_id AND post_likes.user_id = $1 
WHERE 
    posts.neighborhood_id = $2 
ORDER BY 
    posts.created_at DESC 
LIMIT 20 OFFSET $3;
`;

export const getPostsByUserQuery = `
SELECT 
    posts.*, 
    CASE WHEN post_likes.id IS NOT NULL THEN TRUE ELSE FALSE END AS liked_by_user 
FROM 
    posts 
LEFT JOIN 
    post_likes ON posts.id = post_likes.post_id AND post_likes.user_id = $1 
WHERE 
    posts.user_id = $1 
ORDER BY 
    posts.created_at DESC 
LIMIT 10 OFFSET $2;
`;
