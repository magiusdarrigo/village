import { API_URL, authToken } from "./config";

export const listTweets = async () => {
  const url = `${API_URL}/v1/neighborhoods/1/posts`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (res.status !== 200) {
    throw new Error("Error fetching posts");
  }

  return await res.json();
};
