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
  disliked_by_user: boolean;
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
  disliked_by_user: boolean;
};

export type NotificationType = {
  id: number;
  for_user_id: number;
  from_user_id: number;
  from_username: string;
  from_profile_image?: string;
  for_post_id?: number;
  for_comment_id?: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};
