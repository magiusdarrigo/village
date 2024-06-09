import supabaseClient from "./clients/supabaseClient";

export const decrementFollowingCount = async (userID: string) => {
  try {
    // Step 1: Fetch all records in `user_following` where the following_user_id matches the given userID
    let { data: followingRecords, error } = await supabaseClient
      .from("user_following")
      .select("*")
      .eq("following_user_id", userID);

    if (error) throw error;

    if (!followingRecords || followingRecords.length === 0) {
      console.log("No following records found for the given user.");
      return;
    }

    // Step 2: Extract unique user IDs who were followers of the given userID
    const followerUserIds = [
      ...new Set(followingRecords.map((record) => record.follower_user_id)),
    ];

    // Step 3: Decrement the following_count for each unique follower_user_id in the users table
    for (const followerUserId of followerUserIds) {
      let { data: userData, error: fetchError } = await supabaseClient
        .from("users")
        .select("following_count")
        .eq("id", followerUserId)
        .single();

      if (fetchError) throw fetchError;

      if (!userData) {
        console.log(`User with ID ${followerUserId} not found.`);
        continue;
      }

      // Check to prevent negative values
      if (userData.following_count > 0) {
        let { error: updateError } = await supabaseClient
          .from("users")
          .update({ following_count: userData.following_count - 1 })
          .eq("id", followerUserId);

        if (updateError) throw updateError;
      }
    }

    console.log(
      "Updated following counts successfully for all affected users."
    );
  } catch (err: any) {
    console.error("Failed to decrement following counts:", err.message);
  }
};

export const decrementFollowersCount = async (userID: string) => {
  try {
    // Fetch all records where the given userID is a follower
    let { data: followerRecords, error } = await supabaseClient
      .from("user_following")
      .select("*")
      .eq("follower_user_id", userID);

    if (error) throw error;

    if (!followerRecords || followerRecords.length === 0) {
      console.log("No followers found for the given user.");
      return;
    }

    // Process each followed user to decrement their follower count
    for (const record of followerRecords) {
      let { data: userData, error: fetchError } = await supabaseClient
        .from("users")
        .select("followers_count")
        .eq("id", record.following_user_id)
        .single();

      if (fetchError) throw fetchError;

      if (!userData) {
        console.log(`User with ID ${record.following_user_id} not found.`);
        continue;
      }

      // Check to prevent negative values
      if (userData.followers_count > 0) {
        let { error: updateError } = await supabaseClient
          .from("users")
          .update({ followers_count: userData.followers_count - 1 })
          .eq("id", record.following_user_id);

        if (updateError) throw updateError;
      }
    }

    console.log(
      "Updated followers counts successfully for all affected users."
    );
  } catch (err: any) {
    console.error("Failed to decrement followers counts:", err.message);
  }
};
