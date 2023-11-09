import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { User } from "../context/UserContext";

type ProfileProps = {
  user: User;
};

const ModalScreen = ({ user }: ProfileProps) => {
  // Replace with your own image URL and user data

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
    backgroundColor: "lightgrey", // Replace with your themed background color
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
  },
});

export default ModalScreen;
