import supabaseClient from "./postgresClient";
import { rankPosts } from "./ranking";

async function fetchLikesCount() {
  // get the 1000 newest posts from the neighborhood
  const { data: posts, error } = await supabaseClient
    .from("posts")
    .select("id,created_at,likes_count,comments_count")
    .eq("neighborhood_id", 6)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  // sort the posts by the ranking algorithm
  const rankedPostIDs = rankPosts(posts);
}

fetchLikesCount();
