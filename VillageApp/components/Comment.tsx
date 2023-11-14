import { Text, View, StyleSheet, Pressable, Alert } from "react-native";
import { CommentType } from "../types";
import { Link } from "expo-router";
import { calculateHoursAgo } from "../lib/helpers";
import { Entypo } from "@expo/vector-icons";
import { EvilIcon, AntIcon } from "./Icons";
import { useUser } from "../context/UserContext";
import Colors from "../constants/Colors";
import { useTweetsApi } from "../lib/api/tweets";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CommentProps = {
  comment: CommentType;
};

const Comment = ({ comment }: CommentProps) => {
  const { user } = useUser();
  const { reportComment, deleteComment, likeComment, unlikeComment } =
    useTweetsApi();
  const queryClient = useQueryClient();

  const isReply = comment.parent_comment_id !== null;

  if (!user) {
    return null;
  }

  // like a tweet
  const { mutate: mutateLike, isLoading: isLoadingLike } = useMutation(
    likeComment,
    {
      onSuccess: (data: any) => {
        // update the list of comments in the cache
        queryClient.setQueryData(
          ["comments", String(comment.post_id)],
          (old: any) => {
            if (!old) return;
            // Map over the pages
            return {
              ...old,
              pages: old.pages.map((page: { data: any[] }) => {
                // Map over the comments on the page
                return {
                  ...page,
                  data: page.data.map((currentComment) =>
                    currentComment.id === data.newLike.comment_id
                      ? {
                          ...currentComment,
                          liked_by_user: true,
                          likes_count: data.updatedComment.likes_count,
                        }
                      : currentComment
                  ),
                };
              }),
            };
          }
        );
      },
      onError: (error) => {
        console.log(error);
        Alert.alert("We couldn't like this comment. Try again.");
      },
    }
  );

  // unlike a comment
  const { mutate: mutateUnlike, isLoading: isLoadingUnlike } = useMutation(
    unlikeComment,
    {
      onSuccess: (data: any) => {
        // update the list of comments in the cache
        queryClient.setQueryData(
          ["comments", String(comment.post_id)],
          (old: any) => {
            if (!old) return;
            // Map over the pages
            return {
              ...old,
              pages: old.pages.map((page: { data: any[] }) => {
                // Map over the comments on the page
                return {
                  ...page,
                  data: page.data.map((currentComment) =>
                    currentComment.id === data.newUnlike.comment_id
                      ? {
                          ...currentComment,
                          liked_by_user: false,
                          likes_count: data.updatedComment.likes_count,
                        }
                      : currentComment
                  ),
                };
              }),
            };
          }
        );
      },
      onError: (error) => {
        console.log(error);
        Alert.alert("We couldn't like this comment. Try again.");
      },
    }
  );

  // delete a comment
  const { mutate: mutateDelete } = useMutation(deleteComment, {
    onSuccess: (data: any) => {
      // update the list of comments in the cache
      queryClient.setQueryData(
        ["comments", String(comment.post_id)],
        (old: any) => {
          if (!old) return;
          // Map over the pages
          return {
            ...old,
            pages: old.pages.map((page: { data: any[] }) => {
              // Map over the tweets in the page
              return {
                ...page,
                data: page.data.filter(
                  (currentComment) => currentComment.id !== data.id
                ),
              };
            }),
          };
        }
      );
    },
    onError: (error) => {
      console.log(error);
      Alert.alert("We couldn't delete this comment. Try again.");
    },
  });

  const onReport = async (id: number) => {
    try {
      await reportComment(String(id));
      Alert.alert("Comment reported.");
    } catch (error) {
      Alert.alert("We couldn't report this comment. Try again.");
    }
  };

  const handle3DotsPressed = (userID: number, comment: CommentType) => {
    if (userID !== comment.user_id) {
      Alert.alert("Report Comment?", "", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "Yes", onPress: () => onReport(comment.id) },
      ]);
    } else {
      Alert.alert(
        "Delete Comment?",
        "Are you sure you want to delete this Comment?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () =>
              mutateDelete({
                id: String(comment.id),
                postID: String(comment.post_id),
              }),
          },
        ]
      );
    }
  };

  const handleToggleLike = async (commentID: number) => {
    try {
      if (isLoadingLike || isLoadingUnlike) return;
      if (comment.liked_by_user) {
        mutateUnlike(String(comment.id));
      } else {
        mutateLike(String(comment.id));
      }
    } catch (error) {
      Alert.alert("We couldn't like this post. Try again.");
    }
  };

  return (
    <View
      style={
        !isReply
          ? {
              flexDirection: "row",
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderColor: "lightgrey",
              backgroundColor: "white",
            }
          : {
              flexDirection: "row",
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderColor: "lightgrey",
              backgroundColor: Colors.light.replyBackground,
            }
      }
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
                !isReply ? styles.userImage : styles.replyUserImage,
                { backgroundColor: comment.profile_image },
              ]}
            />
          </Pressable>
        </Link>
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
            {comment.parent_comment_id === null && (
              <Pressable style={styles.iconWrapper}>
                <EvilIcon icon="comment" text={comment.replies_count} />
              </Pressable>
            )}
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
  replyUserImage: {
    width: 30,
    height: 30,
    borderRadius: 30,
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
