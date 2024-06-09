import supabaseClient from "./clients/supabaseClient";
import { sendNotification } from "./clients/firebaseClient";
import { villageAppUserID } from "./ban";
import { NewPostWebhookEvent } from "./types/custom";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const notifyUser = async (postEvent: NewPostWebhookEvent) => {
  try {
    // create notification record
    const { error: inserError } = await supabaseClient
      .from("notifications")
      .insert({
        title: "Your recent post has been auto-banned.",
        message: "If you think this was a mistake, contact us.",
        for_user_id: postEvent.record.user_id,
        from_user_id: villageAppUserID,
        for_post_id: postEvent.record.id,
      });

    if (inserError) {
      throw inserError;
    }

    // query for the post author
    const { data: users, error: userError } = await supabaseClient
      .from("users")
      .select("fcm_token")
      .eq("id", postEvent.record.user_id);

    if (userError) {
      throw userError;
    }

    if (!users || users.length === 0) {
      throw new Error("User not found");
    }

    const user = users[0];

    // send notif
    if (user.fcm_token) {
      await sendNotification(
        "Your recent post has been auto-banned.",
        "If you think this was a mistake, contact us.",
        user.fcm_token
      );
    }
  } catch (err: any) {
    console.error("Error in notifyUser:", err);
  }
};

export const emailSupportAcctDeletionReq = async (user_id: string) => {
  const { data: _, error } = await resend.emails.send({
    from: "Support <noreply@support.villageapp.nyc>",
    to: ["magiusdarrigo@gmail.com"],
    subject: "Account Deletion Request",
    html: `
      <h1>New Account Deletion Request</h1>
      <p>User ID: ${user_id}</p>
      `,
  });
  if (error) {
    console.error("Failed to send email to support");
  }
};
