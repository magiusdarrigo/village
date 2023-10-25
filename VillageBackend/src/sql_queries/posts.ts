export const get20NewestPostsForTimelineQuery = `
SELECT 
    "Post".*, 
    CASE WHEN "PostLike".id IS NOT NULL THEN TRUE ELSE FALSE END AS likedByUser 
FROM 
    "Post"
LEFT JOIN 
    "PostLike" ON "Post".id = "PostLike".postID AND "PostLike".userID = $1 
WHERE 
    "Post".neighborhoodID = $2 
ORDER BY 
    "Post".createdAt DESC 
LIMIT 20 OFFSET $3;
`;

export const getPostsByUserQuery = `
SELECT 
    Post.*, 
    CASE WHEN PostLike.id IS NOT NULL THEN TRUE ELSE FALSE END AS likedByUser 
FROM 
    Post 
LEFT JOIN 
    PostLike ON Post.id = PostLike.postID AND PostLike.userID = $1 
WHERE 
    Post.userID = $1 
ORDER BY 
    Post.createdAt DESC 
LIMIT 10 OFFSET $2;
`;
