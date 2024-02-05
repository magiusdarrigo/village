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
  const disablePostPressable = notification.for_post_id === null;
  const notificationHasBeenSeen = notification.read;
  return (
    <View style={postStyles.parentContainer}>
      <View
        style={[
          styles.imageParentContainer,
          notificationHasBeenSeen
            ? { backgroundColor: "white" }
            : { backgroundColor: Colors.light.switchBackgroundColor },
        ]}
      >
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
            <Pressable
              style={{ flex: 1 }}
              disabled={disablePostPressable}
            ></Pressable>
          </Link>
        </View>
        <Link href={`/tweet/${notification.for_post_id}`} asChild>
          <Pressable
            style={styles.parentContainer}
            disabled={disablePostPressable}
          >
            <View style={[styles.mainContainer]}>
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
  parentContainer: {
    flexDirection: "row",
    paddingTop: 10,
    paddingLeft: 5,
    paddingRight: 5,
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    marginLeft: 5,
    marginBottom: 25,
  },
  imageParentContainer: {
    flexDirection: "row",
    flex: 1,
  },
});

export default Notification;
