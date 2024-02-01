import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Image, ImageLoadEventData } from "expo-image";
import { NotificationType } from "../types";
import postStyles from "../lib/styles/post";
import { Link } from "expo-router";
import Colors from "../constants/Colors";

type NotificationProps = {
  notification: NotificationType;
};

const Notification = ({ notification }: NotificationProps) => {
  return (
    <View style={postStyles.parentContainer}>
      <View style={postStyles.imageParentContainer}>
        <View style={postStyles.imageContainer}>
          <Link
            href={{
              pathname: `/profile/${notification.from_user_id}`,
              params: {
                userID: notification.from_user_id,
                username: notification.from_username,
              },
            }}
            asChild
          >
            <Pressable
              style={{
                paddingTop: 10,
                alignItems: "flex-end",
              }}
            >
              <View style={styles.userImage}>
                <Image
                  source={notification.from_profile_image}
                  style={styles.userImage}
                />
              </View>
            </Pressable>
          </Link>
          <Link href={`/tweet/${notification.for_post_id}`} asChild>
            <Pressable style={{ flex: 1 }}></Pressable>
          </Link>
        </View>
        <Link href={`/tweet/${notification.for_post_id}`} asChild>
          <Pressable style={styles.container}>
            <View style={styles.mainContainer}>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.titleContent}>{notification.title}</Text>
              </View>
              <Text style={styles.messageContent}>{notification.message}</Text>
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
  container: {
    flexDirection: "row",
    paddingTop: 10,
    paddingLeft: 5,
    paddingRight: 5,
    flex: 1,
    backgroundColor: "white",
  },
  mainContainer: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: "white",
    marginBottom: 25,
  },
});

export default Notification;
