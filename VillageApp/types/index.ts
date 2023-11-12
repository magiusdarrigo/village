export type TweetType = {
  id: number;
  user_id: number;
  username: string;
  profile_image?: string;
  neighborhood_id: number;
  text_content?: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  liked_by_user: boolean;
};

export type CommentType = {
  id: number;
  username: string;
  profile_image?: string;
  post_id: number;
  user_id: number;
  text_content: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  parent_comment_id?: number;
  liked_by_user: boolean;
};
