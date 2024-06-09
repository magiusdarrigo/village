import supabaseClient from "./clients/supabaseClient";
import streamChatClient from "./clients/streamChatClient";

export const deleteUser = async (userID: string) => {
  // finally, we will delete the user
  const { data: _, error } = await supabaseClient
    .from("users")
    .delete()
    .eq("id", userID)
    .select();
  if (error) {
    console.error("Error deleting user:", error);
    return;
  }

  // delete user from stream chat
  await streamChatClient.deleteUser(userID);
};
