export type NewPostWebhookEvent = {
  type: string;
  table: string;
  record: {
    id: number;
    user_id: string;
    image_url?: string;
    created_at: string;
    text_content?: string;
  };
};
