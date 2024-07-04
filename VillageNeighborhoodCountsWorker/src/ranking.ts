type Post = {
  id: number;
  created_at: string;
  likes_count: number;
  comments_count: number;
};

const envToNumber = (envVar: string | undefined) => {
  if (!envVar) {
    throw new Error("Missing env variable");
  }
  const parsed = Number(envVar);
  if (isNaN(parsed)) {
    throw new Error("Invalid env variable");
  }
  return parsed;
};

const likesWeight = envToNumber(process.env.LIKES_COUNT_RANKING_WEIGHT);
const commentsWeight = envToNumber(process.env.COMMENTS_COUNT_RANKING_WEIGHT);
const recencyWeight = envToNumber(process.env.RECENCY_RANKING_WEIGHT);

export function rankPosts(posts: Post[]) {
  // Copy the posts array to avoid mutating the original array
  const postsCopy = [...posts];

  // Define a scoring function
  // Adjust the weights to tune the importance of likes, comments, and recency
  const scorePost = (post: Post) => {
    const now = new Date().getTime(); // Get the current time in milliseconds
    const createdAt = new Date(post.created_at).getTime(); // Get the post's creation time in milliseconds
    const timeDiffHours = (now - createdAt) / (1000 * 60 * 60); // Calculate time difference in hours

    return (
      likesWeight * post.likes_count +
      commentsWeight * post.comments_count -
      recencyWeight * timeDiffHours
    );
  };

  // Sort the posts based on the score
  postsCopy.sort((a, b) => scorePost(b) - scorePost(a));

  // Return only the sorted post IDs
  return postsCopy.map((post) => post.id);
}
