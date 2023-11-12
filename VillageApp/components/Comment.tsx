import { Text, View, StyleSheet, Pressable, Alert } from "react-native";
import { CommentType } from "../types";
import { Link } from "expo-router";
import { calculateHoursAgo } from "../lib/helpers";
import { Entypo } from "@expo/vector-icons";
import { EvilIcon, AntIcon } from "./Icons";
import { useUser } from "../context/UserContext";

type CommentProps = {
  comment: CommentType;
};

const onReport = async (id: number) => {
  // try {
  //   await reportComment(String(id));
  //   Alert.alert("Comment reported.");
  // } catch (error) {
  //   Alert.alert("We couldn't report this comment. Try again.");
  // }
};

const handle3DotsPressed = (userID: number, comment: CommentType) => {
  //   if (userID !== comment.user_id) {
  //     Alert.alert("Report Comment?", "", [
  //       {
  //         text: "Cancel",
  //         onPress: () => console.log("Cancel Pressed"),
  //         style: "cancel",
  //       },
  //       { text: "Yes", onPress: () => onReport(comment.id) },
  //     ]);
  //   } else {
  //     Alert.alert("Delete Post?", "Are you sure you want to delete this Comment?", [
  //       {
  //         text: "Cancel",
  //         onPress: () => console.log("Cancel Pressed"),
  //         style: "cancel",
  //       },
  //       { text: "Yes", onPress: () => mutateDelete(String(tweet.id)) },
  //     ]);
  //   }
};

const Comment = ({ comment }: CommentProps) => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const handleToggleLike = async (commentID: number) => {
    // try {
    //   if (isLoadingLike || isLoadingUnlike) return;
    //   if (tweet.liked_by_user) {
    //     mutateUnlike(String(postID));
    //   } else {
    //     mutateLike(String(postID));
    //   }
    // } catch (error) {
    //   Alert.alert("We couldn't like this post. Try again.");
    // }
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
        <Link
          href={{
            pathname: `/profile/${comment.user_id}`,
            params: {
              userID: comment.user_id,
              username: comment.username,
              image: comment.profile_image ?? "",
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
            <View
              // source={{ uri: tweet.profile_image }}
              style={[
                styles.userImage,
                // { backgroundColor: tweet.profile_image },
                { backgroundColor: "black" },
              ]}
            />
          </Pressable>
        </Link>
        {/* <Link href={`/tweet/${tweet.id}`} asChild>
          <Pressable style={{ flex: 1 }}></Pressable>
        </Link> */}
      </View>
      <Pressable style={styles.container}>
        <View style={styles.mainContainer}>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.username}>@{comment.username}</Text>
            {calculateHoursAgo(comment.created_at)}
            <Pressable
              style={{ marginLeft: "auto" }}
              onPress={() => handle3DotsPressed(user.id, comment)}
            >
              <Entypo
                name="dots-three-horizontal"
                size={16}
                color="grey"
                style={{ marginLeft: "auto", paddingRight: 10 }}
              />
            </Pressable>
          </View>

          <Text style={styles.content}> {comment.text_content}</Text>
          <View style={styles.footer}>
            <Pressable style={styles.iconWrapper}>
              <EvilIcon icon="comment" text={comment.replies_count} />
            </Pressable>
            <Pressable
              style={styles.iconWrapper}
              onPress={() => handleToggleLike(comment.id)}
            >
              {(comment.liked_by_user && (
                <AntIcon
                  icon="heart"
                  text={comment.likes_count}
                  iconColor="red"
                />
              )) || (
                <AntIcon
                  icon="hearto"
                  text={comment.likes_count}
                  iconColor="#b2b2b2"
                />
              )}
            </Pressable>
            {/* <IconButton icon="share-apple" /> */}
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  imagePressable: {
    padding: 5,
    justifyContent: "center",
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
    width: 120,
    justifyContent: "space-between",
  },
  iconWrapper: {},
});

export default Comment;
