import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { ProfileRowType } from "../types";
import postStyles from "../lib/styles/post";
import { Link } from "expo-router";
import Colors from "../constants/Colors";

type ProfileRowProps = {
  profile: ProfileRowType;
  handleClose: () => void; // Add handleClose prop
};

const ProfileRow = ({ profile, handleClose }: ProfileRowProps) => {
  return (
    <View style={postStyles.parentContainer}>
      <View style={[styles.imageParentContainer, { backgroundColor: "white" }]}>
        <View style={postStyles.imageContainer}>
          <Link
            href={{
              pathname: `/profile/${profile.follower_user_id}`,
              params: {
                userID: profile.follower_user_id,
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
              <View style={styles.userImage}>
                <Image
                  source={profile.profile_image}
                  style={styles.userImage}
                />
              </View>
            </Pressable>
          </Link>
          <Link
            href={{
              pathname: `/profile/${profile.follower_user_id}`,
              params: {
                userID: profile.follower_user_id,
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
              userID: profile.follower_user_id,
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
      </View>
    </View>
  );
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
