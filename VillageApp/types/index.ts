export type User = {
  id: string;
  username: string;
  name: string;
  image?: string;
};

export type TweetType = {
  id: string;
  created_at: string;
  user: User;
  content: string;
  image?: string;
  numberOfComments?: number;
  numberOfRetweets?: number;
  numberOfLikes?: number;
  impressions?: number;
};
