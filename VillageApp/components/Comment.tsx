import { Text, View, StyleSheet, Pressable, Alert } from "react-native";
import { CommentType } from "../types";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { calculateHoursAgo } from "../lib/helpers";
import { Entypo } from "@expo/vector-icons";
import { MaterialCommunityIcon, AntIcon } from "./Icons";
import { useUser } from "../context/UserContext";
import Colors from "../constants/Colors";
import { useTweetsApi } from "../context/TweetContext";
import Hyperlink from "react-native-hyperlink";
import { handlePressButtonAsync } from "../lib/helpers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "sentry-expo";
import postStyles from "../lib/styles/post";

type CommentProps = {
  comment: CommentType;
  handleAddReply: (id: number, index: number | undefined) => void;
  isSelected?: boolean;
  index?: number;
};

const Comment = ({
  comment,
  handleAddReply,
  isSelected,
  index,
}: CommentProps) => {
  const { user, isFeedHot, activeNeighborhood, getIsTextBoldEnabled } =
    useUser();
  const isTextBoldEnabled = getIsTextBoldEnabled();
  const { reportComment, deleteComment, likeComment, unlikeComment } =
    useTweetsApi();
  const queryClient = useQueryClient();

  const isReply = comment.parent_comment_id !== null;

  if (!activeNeighborhood) {
    return null;
  }

  if (!user) {
    return null;
  }

  // like a comment
  const { mutateAsync: mutateLike, isLoading: isLoadingLike } = useMutation(
    likeComment,
    {
      onMutate: async (data: { commentID: string; isDislike: boolean }) => {
        const { commentID, isDislike } = data;
        const likeDelta = isDislike ? -1 : 1;
        // cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(["comments", String(comment.post_id)]);
        // snapshot the previous value
        const previousComments = queryClient.getQueryData([
          "comments",
          String(comment.post_id),
        ]);
        // optimistically update to the new value
        if (previousComments) {
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
                      currentComment.id === Number(commentID)
                        ? {
                            ...currentComment,
                            liked_by_user: !isDislike,
                            disliked_by_user: isDislike,
                            likes_count: currentComment.likes_count + likeDelta,
                          }
                        : currentComment
                    ),
                  };
                }),
              };
            }
          );
        }
        // return a context object with the snapshotted value
        return { previousComments };
      },
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
                          liked_by_user: !data.newLike.is_dislike,
                          disliked_by_user: data.newLike.is_dislike,
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
      onError: (error, _, context) => {
        Sentry.Native.captureException(error);
        Alert.alert("We couldn't like this comment. Try again.");
        // revert to the previous value
        if (context?.previousComments) {
          queryClient.setQueryData(
            ["comments", String(comment.post_id)],
            context.previousComments
          );
        }
      },
    }
  );

  // unlike a comment
  const { mutateAsync: mutateUnlike, isLoading: isLoadingUnlike } = useMutation(
    unlikeComment,
    {
      onMutate: async (data: { commentID: string; isDislike: boolean }) => {
        const { commentID, isDislike } = data;
        const likeDelta = isDislike ? -1 : 1;
        // cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(["comments", String(comment.post_id)]);
        // snapshot the previous value
        const previousComments = queryClient.getQueryData([
          "comments",
          String(comment.post_id),
        ]);
        // optimistically update to the new value
        if (previousComments) {
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
                      currentComment.id === Number(commentID)
                        ? {
                            ...currentComment,
                            liked_by_user: false,
                            disliked_by_user: false,
                            likes_count: currentComment.likes_count - likeDelta,
                          }
                        : currentComment
                    ),
                  };
                }),
              };
            }
          );
        }
        // return a context object with the snapshotted value
        return { previousComments };
      },
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
                          disliked_by_user: false,
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
      onError: (error, _, context) => {
        Sentry.Native.captureException(error);
        Alert.alert("We couldn't like this comment. Try again.");
        // revert to the previous value
        if (context?.previousComments) {
          queryClient.setQueryData(
            ["comments", String(comment.post_id)],
            context.previousComments
          );
        }
      },
    }
  );

  // delete a comment
  const { mutate: mutateDelete } = useMutation(deleteComment, {
    onSuccess: (data: any) => {
      // update the single tweet cache with a +1 total comments count
      queryClient.setQueryData(
        ["tweets", String(comment.post_id)],
        (old: any) => {
          if (!old) return;
          return {
            ...old,
            comments_count: old.comments_count - 1,
          };
        }
      );
      // update the tweet list cache with a +1 total comments count for the tweet
      queryClient.setQueryData(
        ["infinitetweets", activeNeighborhood.id, isFeedHot],
        (old: any) => {
          if (!old) return;
          return {
            ...old,
            pages: old.pages.map((page: any) => {
              return {
                ...page,
                data: page.data.map((tweet: any) => {
                  if (tweet.id === comment.post_id) {
                    return {
                      ...tweet,
                      comments_count: tweet.comments_count - 1,
                    };
                  }
                  return tweet;
                }),
              };
            }),
          };
        }
      );
      queryClient.setQueryData(
        ["profiletweets", String(user.id)],
        (old: any) => {
          if (!old) return;
          return {
            ...old,
            pages: old.pages.map((page: any) => {
              return {
                ...page,
                data: page.data.map((tweet: any) => {
                  if (tweet.id === comment.post_id) {
                    return {
                      ...tweet,
                      comments_count: tweet.comments_count - 1,
                    };
                  }
                  return tweet;
                }),
              };
            }),
          };
        }
      );
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
      Sentry.Native.captureException(error);
      Alert.alert("We couldn't delete this comment. Try again.");
    },
  });

  const onReport = async (id: number) => {
    try {
      await reportComment(String(id));
      Alert.alert("Comment reported.");
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We couldn't report this comment. Try again.");
    }
  };

  const handle3DotsPressed = (userID: string, comment: CommentType) => {
    if (userID !== comment.user_id) {
      Alert.alert("Report Comment?", "", [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Yes", onPress: () => onReport(comment.id) },
      ]);
    } else {
      Alert.alert(
        "delete comment?",
        "are you sure you want to delete this comment?",
        [
          {
            text: "Cancel",
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

  const handleToggleLike = async (isDislike: boolean) => {
    try {
      if (isLoadingLike || isLoadingUnlike) return;
      const dislikePayload = {
        commentID: String(comment.id),
        isDislike: true,
      };

      const likePayload = {
        commentID: String(comment.id),
        isDislike: false,
      };

      if (comment.liked_by_user && !isDislike) {
        await mutateUnlike(likePayload);
        return;
      }

      if (comment.liked_by_user && isDislike) {
        await mutateUnlike(likePayload);
        await mutateLike(dislikePayload);
        return;
      }

      if (comment.disliked_by_user && isDislike) {
        await mutateUnlike(dislikePayload);
        return;
      }

      if (comment.disliked_by_user && !isDislike) {
        await mutateUnlike(dislikePayload);
        await mutateLike(likePayload);
        return;
      }

      // if the user hasn't liked or disliked the comment
      if (!comment.liked_by_user && !comment.disliked_by_user && isDislike) {
        await mutateLike(dislikePayload);
        return;
      }
      if (!comment.liked_by_user && !comment.disliked_by_user && !isDislike) {
        await mutateLike(likePayload);
        return;
      }
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We couldn't like this comment. Try again.");
    }
  };

  return (
    <View
      style={
        !isReply
          ? !isSelected
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
                backgroundColor: Colors.light.selectedCommentBackground,
              }
          : {
              flexDirection: "row",
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderColor: "lightgrey",
              backgroundColor: Colors.light.switchBackgroundColor,
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
            },
          }}
          push
          asChild
        >
          <Pressable
            style={{
              paddingTop: 10,
              alignItems: "flex-end",
            }}
          >
            <View style={!isReply ? styles.userImage : styles.replyUserImage}>
              <Image
                source={comment.profile_image}
                style={!isReply ? styles.userImage : styles.replyUserImage}
              />
            </View>
          </Pressable>
        </Link>
      </View>
      <Pressable style={styles.container}>
        <View style={styles.mainContainer}>
          <View style={{ flexDirection: "row" }}>
            <Text style={postStyles.username}>@{comment.username}</Text>
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
          <Hyperlink
            linkStyle={{ color: "#2980b9" }}
            onPress={handlePressButtonAsync}
          >
            <Text
              style={[
                postStyles.textContent,
                isTextBoldEnabled
                  ? { fontWeight: "500" }
                  : { fontWeight: "700" },
              ]}
            >
              {comment.text_content}
            </Text>
          </Hyperlink>
          <View style={postStyles.commentFooter}>
            {comment.parent_comment_id === null && (
              <Pressable
                style={{ paddingTop: 2 }}
                onPress={() => handleAddReply(comment.id, index)}
              >
                <MaterialCommunityIcon
                  icon="comment-outline"
                  text={comment.replies_count}
                  iconColor="#b2b2b2"
                  size={22}
                />
              </Pressable>
            )}
            <View style={postStyles.likesContainer}>
              <Pressable onPress={() => handleToggleLike(false)}>
                {(comment.liked_by_user && (
                  <AntIcon icon="like1" iconColor="red" size={22} />
                )) || <AntIcon icon="like2" iconColor="#b2b2b2" size={22} />}
              </Pressable>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: Colors.light.counterFontColor,
                  marginLeft: 5,
                  marginRight: 6,
                }}
              >
                {comment.likes_count}
              </Text>
              <Pressable onPress={() => handleToggleLike(true)}>
                {(comment.disliked_by_user && (
                  <AntIcon icon="dislike1" iconColor="red" size={22} />
                )) || <AntIcon icon="dislike2" iconColor="#b2b2b2" size={22} />}
              </Pressable>
            </View>
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
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
    marginVertical: 10,
    borderRadius: 15,
  },
});

export default Comment;
