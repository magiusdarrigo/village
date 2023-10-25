export const get20NewestPostsForTimelineQuery = `
SELECT 
    posts.*, 
    CASE WHEN post_likes.id IS NOT NULL THEN TRUE ELSE FALSE END AS likedByUser 
FROM 
    posts
LEFT JOIN 
    post_likes ON posts.id = post_likes.postID AND post_likes.userID = $1 
WHERE 
    posts.neighborhoodID = $2 
ORDER BY 
    posts.createdAt DESC 
LIMIT 20 OFFSET $3;
`;

export const getPostsByUserQuery = `
SELECT 
    posts.*, 
    CASE WHEN post_likes.id IS NOT NULL THEN TRUE ELSE FALSE END AS likedByUser 
FROM 
    posts 
LEFT JOIN 
    post_likes ON posts.id = post_likes.postID AND post_likes.userID = $1 
WHERE 
    posts.userID = $1 
ORDER BY 
    posts.createdAt DESC 
LIMIT 10 OFFSET $2;
`;
