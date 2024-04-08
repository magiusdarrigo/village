import supabaseClient from "./clients/supabaseClient";
import { NewPostWebhookEvent } from "./types/custom";

export const villageAppUserID = "48ab4fe3-de6a-4fa3-b774-2ae192451ab4";

export const banPost = async (postEvent: NewPostWebhookEvent) => {
  try {
    // update the post in the db, set ban to true
    const { error: updateError } = await supabaseClient
      .from("posts")
      .update({
        is_banned: true,
      })
      .eq("id", postEvent.record.id);

    if (updateError) {
      throw updateError;
    }

    // add the post to the reported posts table
    const { error: insertError } = await supabaseClient
      .from("reported_posts")
      .insert({
        post_id: postEvent.record.id,
        user_id_reporting: villageAppUserID,
        reason: "abuse auto-detected",
      });

    if (insertError) {
      throw insertError;
    }
  } catch (err: any) {
    console.error("Error in banPost:", err);
  }
};
