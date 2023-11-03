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

export const getTweet = async (id: string) => {
  const url = `${API_URL}/v1/posts/${id}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (res.status !== 200) {
    throw new Error("Error fetching post");
  }

  const body = await res.json();

  console.log(body);

  return body;
};
