import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { ProfileRowType } from "../types";
import postStyles from "../lib/styles/post";
import { Link } from "expo-router";
import Colors from "../constants/Colors";
import profileStyles from "../lib/styles/profile";
import { useFollowUser, useUnfollowUser } from "../mutations/Followers";
import { useUser } from "../context/UserContext";

type ProfileRowProps = {
  profile: ProfileRowType;
  handleClose: () => void;
  userIDOfProfile: string;
  isInviteRow?: boolean;
};

const ProfileRow = ({
  profile,
  handleClose,
  userIDOfProfile,
  isInviteRow,
}: ProfileRowProps) => {
  const followUserMutation = useFollowUser();
  const unfollowUserMutation = useUnfollowUser();
  const { user } = useUser();

  const userIDOfRow = profile.follower_user_id ?? profile.following_user_id;
  if (!userIDOfRow) {
    return null;
  }

  // check if the user is the same as the profile
  const isOwnUser = user?.id === userIDOfRow;

  const handleFollowUser = () => {
    if (followUserMutation.isLoading || unfollowUserMutation.isLoading) {
      return;
    }
    followUserMutation.mutate({
      userIDToFollow: userIDOfRow,
      userIDOfProfile,
    });
  };

  const handleUnfollowUser = () => {
    if (followUserMutation.isLoading || unfollowUserMutation.isLoading) {
      return;
    }
    unfollowUserMutation.mutate({
      userIDToUnfollow: userIDOfRow,
      userIDOfProfile,
    });
  };

  return (
    <View style={postStyles.parentContainer}>
      <View style={[styles.imageParentContainer, { backgroundColor: "white" }]}>
        <View
          style={[postStyles.imageContainer, isInviteRow ? { width: 20 } : {}]}
        >
          <Link
            href={{
              pathname: `/profile/${profile.follower_user_id}`,
              params: {
                userID: userIDOfRow,
                username: profile.username,
              },
            }}
            asChild
          >
            <Pressable
              style={{
                paddingTop: 10,
                alignItems: "flex-end",
              }}
              onPress={handleClose}
            >
              <View style={[styles.userImage]}>
                <Image
                  source={profile.profile_image}
                  style={[styles.userImage]}
                />
              </View>
            </Pressable>
          </Link>
          <Link
            href={{
              pathname: `/profile/${profile.follower_user_id}`,
              params: {
                userID: userIDOfRow,
                username: profile.username,
              },
            }}
            asChild
            push={true}
          >
            <Pressable style={{ flex: 1 }} onPress={handleClose}></Pressable>
          </Link>
        </View>
        <Link
          href={{
            pathname: `/profile/${profile.follower_user_id}`,
            params: {
              userID: userIDOfRow,
              username: profile.username,
            },
          }}
          asChild
          push={true}
        >
          <Pressable style={styles.parentContainer} onPress={handleClose}>
            <View style={[styles.mainContainer]}>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.titleContent}>{profile.username}</Text>
              </View>
              <Text style={styles.messageContent}>
                Lives in {profile.neighborhood_name}
              </Text>
            </View>
          </Pressable>
        </Link>
        {isInviteRow && (
          <View
            style={[
              profileStyles.followButtonContainer,
              { justifyContent: "center" },
            ]}
          >
            <Pressable
              style={[
                profileStyles.followButton,
                { width: 100, backgroundColor: "#4CBB17" },
              ]}
              onPress={() => {}}
            >
              <Text style={profileStyles.followButtonText}>Invite</Text>
            </Pressable>
          </View>
        )}
        {isOwnUser || isInviteRow ? null : (
          <View
            style={[
              profileStyles.followButtonContainer,
              { justifyContent: "center" },
            ]}
          >
            {profile.followed_by_user ? (
              <Pressable
                style={[profileStyles.unfollowButton, { width: 100 }]}
                onPress={handleUnfollowUser}
              >
                <Text style={profileStyles.unfollowButtonText}>Following</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[profileStyles.followButton, { width: 100 }]}
                onPress={handleFollowUser}
              >
                <Text style={profileStyles.followButtonText}>Follow</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

ProfileRow.defaultProps = {
  isInviteRow: false,
};

const styles = StyleSheet.create({
  titleContent: {
    fontSize: 17,
    fontWeight: "bold",
  },
  messageContent: {
    lineHeight: 20,
    marginTop: 5,
    fontSize: 15,
    fontWeight: "600",
    marginRight: 10,
    color: Colors.light.switchFontColor,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  parentContainer: {
    flexDirection: "row",
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 25,
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  imageParentContainer: {
    flexDirection: "row",
    flex: 1,
  },
});

export default ProfileRow;
