import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ModalScreen() {
  // Replace with your own image URL and user data
  const userProfile = {
    photo: "https://via.placeholder.com/150",
    username: "Username",
    following: 120,
    followers: 200,
    tweets: [
      { id: "t1", content: "First tweet" },
      { id: "t2", content: "Second tweet" },
      // ... more tweets
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: userProfile.photo }}
          style={styles.profilePhoto}
        />
        <Text style={styles.username}>@{userProfile.username}</Text>
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            Following: {userProfile.following}
          </Text>
          <Text style={styles.countText}>
            Followers: {userProfile.followers}
          </Text>
        </View>
      </View>
      <View style={styles.tweetsContainer}>
        {userProfile.tweets.map((tweet) => (
          <View key={tweet.id} style={styles.tweet}>
            <Text>{tweet.content}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

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
