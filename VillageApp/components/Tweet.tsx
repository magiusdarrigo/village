import { View, Text, Image, StyleSheet, Pressable, Alert } from "react-native";
import { useState, useEffect } from "react";
import { TweetType } from "../types";
import { Entypo } from "@expo/vector-icons";
import { EvilIcon, AntIcon } from "./Icons";
import { Link } from "expo-router";

type TweetProps = {
  tweet: TweetType;
};

const onReported = (id: string) => {
  console.warn("Post reported");
};

const handleReportPostAlert = (id: string) => {
  Alert.alert("Report Post?", "", [
    {
      text: "Cancel",
      onPress: () => console.log("Cancel Pressed"),
      style: "cancel",
    },
    { text: "Yes", onPress: (id) => onReported(id) },
  ]);
};

const calculateHoursAgo = (time: string) => {
  const now = new Date();
  const date = new Date(time);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return <Text style={styles.time}>· {seconds}s</Text>;
  } else if (minutes < 60) {
    return <Text style={styles.time}>· {minutes}m</Text>;
  } else if (hours < 24) {
    return <Text style={styles.time}>· {hours}h</Text>;
  } else {
    const dateWithoutYear = date
      .toDateString()
      .split(" ")
      .slice(0, 3)
      .join(" ");
    return <Text style={styles.time}>· {dateWithoutYear}</Text>;
  }
};

const Tweet = ({ tweet }: TweetProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleToggleLike = (id: string) => {
    if (isLiked) {
      setIsLiked(false);
    } else {
      setIsLiked(true);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "lightgrey",
        backgroundColor: "white",
      }}
    >
      <View
        style={{
          width: 60,
          flexDirection: "column",
        }}
      >
        <Link href={`/profile/${tweet.user.id}`} asChild>
          <Pressable
            style={{
              paddingTop: 10,
              alignItems: "flex-end",
            }}
          >
            <Image src={tweet.user.image} style={styles.userImage} />
          </Pressable>
        </Link>
        <Link href={`/tweet/${tweet.id}`} asChild>
          <Pressable style={{ flex: 1 }}></Pressable>
        </Link>
      </View>
      <Link href={`/tweet/${tweet.id}`} asChild>
        <Pressable style={styles.container}>
          <View style={styles.mainContainer}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.username}>@{tweet.user.username}</Text>
              {calculateHoursAgo(tweet.created_at)}
              <Pressable
                style={{ marginLeft: "auto" }}
                onPress={() => handleReportPostAlert(tweet.id)}
              >
                <Entypo
                  name="dots-three-horizontal"
                  size={16}
                  color="grey"
                  style={{ marginLeft: "auto", paddingRight: 10 }}
                />
              </Pressable>
            </View>

            <Text style={styles.content}> {tweet.content}</Text>

            {tweet.image && <Image src={tweet.image} style={styles.image} />}

            <View style={styles.footer}>
              <Pressable style={styles.iconWrapper}>
                <EvilIcon icon="comment" text={tweet.numberOfComments} />
              </Pressable>
              <Pressable
                style={styles.iconWrapper}
                onPress={() => handleToggleLike(tweet.id)}
              >
                {(isLiked && (
                  <AntIcon
                    icon="heart"
                    text={tweet.numberOfLikes}
                    iconColor="red"
                  />
                )) || (
                  <AntIcon
                    icon="hearto"
                    text={tweet.numberOfLikes}
                    iconColor="#b2b2b2"
                  />
                )}
              </Pressable>
              {/* <IconButton icon="share-apple" /> */}
            </View>
          </View>
        </Pressable>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  imagePressable: {
    padding: 5, // give some touchable space around the image
    justifyContent: "center", // to vertically center the image if the main content is taller
  },
  container: {
    flexDirection: "row",
    padding: 10,
    paddingLeft: 5,
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    marginLeft: 5,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  username: {
    fontWeight: "bold",
  },
  time: {
    color: "grey",
    marginLeft: 5,
  },
  content: {
    lineHeight: 20,
    marginTop: 5,
  },
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
    marginVertical: 10,
    borderRadius: 15,
  },
  footer: {
    flexDirection: "row",
    marginVertical: 5,
    justifyContent: "flex-start",
  },
  iconWrapper: {
    marginRight: 20,
    width: 60,
  },
});

export default Tweet;
