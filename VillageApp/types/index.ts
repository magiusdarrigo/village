export type User = {
  id: string;
  username: string;
  name: string;
  image?: string;
};

export type TweetType = {
  id: string;
  createdAt: string;
  user: User;
  content: string;
  image?: string;
  numberOfComments?: number;
  numberOfRetweets?: number;
  numberOfLikes?: number;
};
