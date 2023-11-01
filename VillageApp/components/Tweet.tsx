import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { TweetType } from "../types";
import { Entypo } from "@expo/vector-icons";
import IconButton from "../components/IconButton";
import { Link } from "expo-router";

type TweetProps = {
  tweet: TweetType;
};

const calculateHoursAgo = (time: string) => {
  const now = new Date();
  const date = new Date(time);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return <Text style={styles.time}> · {seconds}s</Text>;
  } else if (minutes < 60) {
    return <Text style={styles.time}> · {minutes}m</Text>;
  } else if (hours < 24) {
    return <Text style={styles.time}> · {hours}h</Text>;
  } else {
    const dateWithoutYear = date
      .toDateString()
      .split(" ")
      .slice(0, 3)
      .join(" ");
    return <Text style={styles.time}> · {dateWithoutYear}</Text>;
  }
};

const Tweet = ({ tweet }: TweetProps) => {
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
          <Pressable style={{ flex: 2 }}></Pressable>
        </Link>
      </View>
      <Link href={`/tweet/${tweet.id}`} asChild>
        <Pressable style={styles.container}>
          <View style={styles.mainContainer}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.username}>@{tweet.user.username}</Text>
              {calculateHoursAgo(tweet.created_at)}
              <Entypo
                name="dots-three-horizontal"
                size={16}
                color="grey"
                style={{ marginLeft: "auto", paddingRight: 10 }}
              />
            </View>

            <Text style={styles.content}> {tweet.content}</Text>

            {tweet.image && <Image src={tweet.image} style={styles.image} />}

            <View style={styles.footer}>
              <Pressable style={styles.iconWrapper}>
                <IconButton icon="comment" text={tweet.numberOfComments} />
              </Pressable>
              <Pressable style={styles.iconWrapper}>
                <IconButton icon="heart" text={tweet.numberOfLikes} />
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
    marginRight: 40,
  },
});

export default Tweet;
