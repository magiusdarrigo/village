import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { User } from "../context/UserContext";
import Colors from "../constants/Colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTweetsApi } from "../lib/api/tweets";

type ProfileProps = {
  user: User;
};

const ModalScreen = ({ user }: ProfileProps) => {
  // todo: delete below line
  console.log("user", user);
  const queryClient = useQueryClient();
  const { followUser, unFollowUser } = useTweetsApi();

  const { mutate: mutateFollowUser, isLoading: isLoadingFollow } = useMutation(
    followUser,
    {
      onSuccess: (data) => {
        queryClient.setQueryData(["profiles", String(user.id)], (_: any) => {
          return {
            ...data,
            followed_by_user: true,
          };
        });
      },
      onError: (error) => {
        console.log(error);
        Alert.alert("We had an issue following this user. Try again.");
      },
    }
  );

  const { mutate: mutateUnfollowUser, isLoading: isLoadingUnfollow } =
    useMutation(unFollowUser, {
      onSuccess: (data) => {
        queryClient.setQueryData(["profiles", String(user.id)], (_: any) => {
          return {
            ...data,
            followed_by_user: false,
          };
        });
      },
      onError: (error) => {
        console.log(error);
        Alert.alert("We had an issue unfollowing this user. Try again.");
      },
    });

  const handleFollowUser = () => {
    if (isLoadingFollow || isLoadingUnfollow) {
      return;
    }
    mutateFollowUser(String(user.id));
  };

  const handleUnfollowUser = () => {
    if (isLoadingFollow || isLoadingUnfollow) {
      return;
    }
    mutateUnfollowUser(String(user.id));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={[styles.profilePhoto, { backgroundColor: user.image }]} />
        <Text style={styles.username}>@{user.username}</Text>
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            Following: {user.following_count ?? ""}
          </Text>
          <Text style={styles.countText}>
            Followers: {user.followers_count ?? ""}
          </Text>
        </View>
        <View style={styles.followButtonContainer}>
          {user.followed_by_user ? (
            <Pressable
              style={styles.unfollowButton}
              onPress={handleUnfollowUser}
            >
              <Text style={styles.unfollowButtonText}>Following</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.followButton} onPress={handleFollowUser}>
              <Text style={styles.followButtonText}>Follow</Text>
            </Pressable>
          )}
        </View>
      </View>
      {/* <View style={styles.tweetsContainer}>
        {userProfile.tweets.map((tweet) => (
          <View key={tweet.id} style={styles.tweet}>
            <Text>{tweet.content}</Text>
          </View>
        ))}
      </View> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  followButtonContainer: {
    backgroundColor: "transparent",
  },
  followButton: {
    backgroundColor: Colors.light.tertiary,
    borderRadius: 50,
    padding: 5,
    paddingHorizontal: 15,
  },
  followButtonText: {
    fontWeight: "600",
    color: "black",
    fontSize: 16,
  },
  unfollowButton: {
    backgroundColor: "transparent",
    borderRadius: 50,
    padding: 5,
    paddingHorizontal: 15,
    borderColor: "black",
    borderWidth: 1,
  },
  unfollowButtonText: {
    fontWeight: "600",
    color: "black",
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  profileHeader: {
    alignItems: "center",
    marginVertical: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 8,
  },
  countContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 8,
  },
  countText: {
    fontSize: 16,
  },
  tweetsContainer: {
    alignItems: "center",
  },
  tweet: {
    width: "90%",
    backgroundColor: "lightgrey",
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
  },
});

export default ModalScreen;
