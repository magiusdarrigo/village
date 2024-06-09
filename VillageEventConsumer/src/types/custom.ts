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

export type NewAccountDeletionRequestWebhookEvent = {
  type: string;
  table: string;
  record: {
    id: number;
    user_id: string;
    reason: string;
    username: string;
    building_id: number;
    phone_number: string;
    created_at: string;
  };
};
