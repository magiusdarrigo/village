export type NewAccountDeletionRequestWebhookEvent = {
  type: string;
  table: string;
  record: {
    id: number;
    user_id: string;
    reason: string;
    created_at: string;
    username: string;
  };
};

export type NewBuildingChangeRequestWebhookEvent = {
  type: string;
  table: string;
  record: {
    id: number;
    user_id: string;
    address_request: string;
    created_at: string;
  };
};

export type NewReportedPostWebhookEvent = {
  type: string;
  table: string;
  record: {
    id: number;
    post_id: string;
    user_id_reporting: string;
    reason: string;
    created_at: string;
  };
};

export type NewReportedCommentWebhookEvent = {
  type: string;
  table: string;
  record: {
    id: number;
    comment_id: string;
    user_id_reporting: string;
    reason: string;
    created_at: string;
  };
};
