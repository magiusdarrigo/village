import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Image, ImageLoadEventData } from "expo-image";
import { useEffect, useState } from "react";
import { TweetType } from "../types";
import { Entypo } from "@expo/vector-icons";
import { AntIcon, MaterialCommunityIcon } from "./Icons";
import { Link, useNavigation, useSegments } from "expo-router";
import { useTweetsApi } from "../context/TweetContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "../context/UserContext";
import { calculateHoursAgo } from "../lib/helpers";
import * as Sentry from "sentry-expo";
import postStyles from "../lib/styles/post";
import Hyperlink from "react-native-hyperlink";
import { handlePressButtonAsync } from "../lib/helpers";
import Colors from "../constants/Colors";

type TweetProps = {
  tweet: TweetType;
  handleCommentIconClicked: () => void;
};

const Tweet = ({ tweet, handleCommentIconClicked }: TweetProps) => {
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [postWidth, setPostWidth] = useState(1);
  const { likeTweet, unlikeTweet, deleteTweet, reportTweet } = useTweetsApi();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const segments = useSegments();
  const { user } = useUser();
  if (!user) {
    Alert.alert("Something went wrong. Try again.");
    return null;
  }

  const onLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setPostWidth(width - 20);
  };

  // +1 on either like or dislike
  const { mutateAsync: mutateLike, isLoading: isLoadingLike } = useMutation(
    likeTweet,
    {
      onMutate: async (data: { postID: string; isDislike: boolean }) => {
        const { postID, isDislike } = data;
        const likeDelta = isDislike ? -1 : 1;
        // cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await Promise.all([
          queryClient.cancelQueries(["tweets", postID]),
          queryClient.cancelQueries(["tweets"]),
        ]);

        // snapshot the previous value
        const previousTweets = queryClient.getQueryData(["tweets"]);
        const previousTweet = queryClient.getQueryData([
          "tweets",
          String(tweet.id),
        ]);

        // optimistic update
        queryClient.setQueryData(["tweets", postID], (old: any) => {
          return {
            ...old,
            liked_by_user: !isDislike,
            disliked_by_user: isDislike,
            likes_count: old?.likes_count + likeDelta,
          };
        });
        queryClient.setQueryData(["tweets"], (old: any) => {
          if (!old) return;
          // Map over the pages
          return {
            ...old,
            pages: old.pages.map((page: { data: any[] }) => {
              // Map over the tweets in the page
              return {
                ...page,
                data: page.data.map((tweet) =>
                  tweet.id === Number(postID)
                    ? {
                        ...tweet,
                        liked_by_user: !isDislike,
                        disliked_by_user: isDislike,
                        likes_count: tweet.likes_count + likeDelta,
                      }
                    : tweet
                ),
              };
            }),
          };
        });

        // return a context object with the snapshotted values
        return { previousTweets, previousTweet };
      },
      onSuccess: (data) => {
        // update the single tweet in the cache
        queryClient.setQueryData(["tweets", String(tweet.id)], (old: any) => {
          return {
            ...old,
            liked_by_user: !data.newLike.is_dislike,
            disliked_by_user: data.newLike.is_dislike,
            likes_count: data.updatedPost.likes_count,
          };
        });
        // update the list of tweets in the cache
        queryClient.setQueryData(["tweets"], (old: any) => {
          if (!old) return;
          // Map over the pages
          return {
            ...old,
            pages: old.pages.map((page: { data: any[] }) => {
              // Map over the tweets in the page
              return {
                ...page,
                data: page.data.map((tweet) =>
                  tweet.id === data.newLike.post_id
                    ? {
                        ...tweet,
                        liked_by_user: !data.newLike.is_dislike,
                        disliked_by_user: data.newLike.is_dislike,
                        likes_count: data.updatedPost.likes_count,
                      }
                    : tweet
                ),
              };
            }),
          };
        });
      },
      onError: (error, _, context) => {
        Sentry.Native.captureException(error);
        Alert.alert("We couldn't like this post. Try again.");

        // revert to the previous value
        if (context?.previousTweets) {
          queryClient.setQueryData(["tweets"], context.previousTweets);
        }
        if (context?.previousTweet) {
          queryClient.setQueryData(
            ["tweets", String(tweet.id)],
            context.previousTweet
          );
        }
      },
    }
  );

  // -1 on either like or dislike
  const { mutateAsync: mutateUnlike, isLoading: isLoadingUnlike } = useMutation(
    unlikeTweet,
    {
      onMutate: async (data: { postID: string; isDislike: boolean }) => {
        const { postID, isDislike } = data;
        const likeDelta = isDislike ? -1 : 1;
        await Promise.all([
          queryClient.cancelQueries(["tweets", postID]),
          queryClient.cancelQueries(["tweets"]),
        ]);

        // snapshot the previous values
        const previousTweets = queryClient.getQueryData(["tweets"]);
        const previousTweet = queryClient.getQueryData([
          "tweets",
          String(tweet.id),
        ]);

        // optimistic updates
        queryClient.setQueryData(["tweets", postID], (old: any) => {
          return {
            ...old,
            liked_by_user: false,
            disliked_by_user: false,
            likes_count: old?.likes_count - likeDelta,
          };
        });

        queryClient.setQueryData(["tweets"], (old: any) => {
          if (!old) return;
          // Map over the pages
          return {
            ...old,
            pages: old.pages.map((page: { data: any[] }) => {
              // Map over the tweets in the page
              return {
                ...page,
                data: page.data.map((tweet) =>
                  tweet.id === Number(postID)
                    ? {
                        ...tweet,
                        liked_by_user: false,
                        disliked_by_user: false,
                        likes_count: tweet.likes_count - likeDelta,
                      }
                    : tweet
                ),
              };
            }),
          };
        });

        // return a context object with the snapshotted values
        return { previousTweets, previousTweet };
      },
      onSuccess: (data) => {
        // update the single tweet in the cache
        queryClient.setQueryData(["tweets", String(tweet.id)], (old: any) => {
          return {
            ...old,
            liked_by_user: false,
            disliked_by_user: false,
            likes_count: data.updatedPost.likes_count,
          };
        });
        // update the list of tweets in the cache
        queryClient.setQueryData(["tweets"], (old: any) => {
          if (!old) return;
          // Map over the pages
          return {
            ...old,
            pages: old.pages.map((page: { data: any[] }) => {
              // Map over the tweets in the page
              return {
                ...page,
                data: page.data.map((tweet) =>
                  tweet.id === data.newUnlike.post_id
                    ? {
                        ...tweet,
                        liked_by_user: false,
                        disliked_by_user: false,
                        likes_count: data.updatedPost.likes_count,
                      }
                    : tweet
                ),
              };
            }),
          };
        });
      },
      onError: (error, _, context) => {
        Sentry.Native.captureException(error);
        Alert.alert("We couldn't like this post. Try again.");
        // revert to the previous value
        if (context?.previousTweets) {
          queryClient.setQueryData(["tweets"], context.previousTweets);
        }
        if (context?.previousTweet) {
          queryClient.setQueryData(
            ["tweets", String(tweet.id)],
            context.previousTweet
          );
        }
      },
    }
  );

  // delete a tweet
  const { mutate: mutateDelete } = useMutation(deleteTweet, {
    onSuccess: (data) => {
      // update the list of tweets in the cache
      queryClient.setQueryData(["tweets"], (old: any) => {
        if (!old) return;
        // Map over the pages
        return {
          ...old,
          pages: old.pages.map((page: { data: any[] }) => {
            // Map over the tweets in the page
            return {
              ...page,
              data: page.data.filter((tweet) => tweet.id !== data.id),
            };
          }),
        };
      });
      // if the tweet is open, go back to the feed
      const segLen = segments.length;
      if (
        segLen >= 2 &&
        segments[segLen - 2] === "tweet" &&
        segments[segLen - 1] === "[id]"
      ) {
        navigation.goBack();
      }
    },
    onError: (error) => {
      Sentry.Native.captureException(error);
      Alert.alert("We couldn't delete this post. Try again.");
    },
  });

  const onReport = async (id: number) => {
    try {
      await reportTweet(String(id));
      Alert.alert("Post reported.");
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We couldn't report this post. Try again.");
    }
  };

  const handle3DotsPressed = (userID: number, tweet: TweetType) => {
    if (userID !== tweet.user_id) {
      Alert.alert("Report Post?", "", [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Yes", onPress: () => onReport(tweet.id) },
      ]);
    } else {
      Alert.alert(
        "Delete Post?",
        "Are you sure you want to delete this post?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          { text: "Yes", onPress: () => mutateDelete(String(tweet.id)) },
        ]
      );
    }
  };

  const handleToggleLike = async (isDislike: boolean) => {
    try {
      if (isLoadingLike || isLoadingUnlike) return;
      const dislikePayload = {
        postID: String(tweet.id),
        isDislike: true,
      };

      const likePayload = {
        postID: String(tweet.id),
        isDislike: false,
      };

      if (tweet.liked_by_user && !isDislike) {
        await mutateUnlike(likePayload);
        return;
      }

      if (tweet.liked_by_user && isDislike) {
        await mutateUnlike(likePayload);
        await mutateLike(dislikePayload);
        return;
      }

      if (tweet.disliked_by_user && isDislike) {
        await mutateUnlike(dislikePayload);
        return;
      }

      if (tweet.disliked_by_user && !isDislike) {
        await mutateUnlike(dislikePayload);
        await mutateLike(likePayload);
        return;
      }

      // if the user hasn't liked or disliked the post
      if (!tweet.liked_by_user && !tweet.disliked_by_user && isDislike) {
        await mutateLike(dislikePayload);
        return;
      }
      if (!tweet.liked_by_user && !tweet.disliked_by_user && !isDislike) {
        await mutateLike(likePayload);
        return;
      }
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We couldn't like this post. Try again.");
    }
  };

  const onPostImageLoad = (e: ImageLoadEventData) => {
    const { width, height } = e.source;
    // Calculate aspect ratio
    const aspectRatio = width / height;
    // Set width and height based on aspect ratio
    const scaledHeight = postWidth / aspectRatio;
    setImageSize({ width: postWidth, height: scaledHeight });
  };

  return (
    <View
      style={{
        flexDirection: "column",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "lightgrey",
        backgroundColor: "white",
      }}
      onLayout={onLayout}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "white",
          flex: 1,
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
              pathname: `/profile/${tweet.user_id}`,
              params: {
                userID: tweet.user_id,
                username: tweet.username,
                image: tweet.profile_image ?? "",
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
                <Image source={tweet.profile_image} style={styles.userImage} />
              </View>
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
                <Text style={postStyles.username}>@{tweet.username}</Text>
                {calculateHoursAgo(tweet.created_at)}
                <Pressable
                  style={{ marginLeft: "auto" }}
                  onPress={() => handle3DotsPressed(user.id, tweet)}
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
                <Text style={postStyles.textContent}>{tweet.text_content}</Text>
              </Hyperlink>
            </View>
          </Pressable>
        </Link>
      </View>
      <Link href={`/tweet/${tweet.id}`} asChild>
        <Pressable style={{ flex: 1 }}>
          <View
            style={{
              paddingHorizontal: 10,
              backgroundColor: "white",
            }}
          >
            {tweet.image_url && (
              <Image
                source={tweet.image_url}
                onLoad={onPostImageLoad}
                style={[
                  { width: imageSize.width, height: imageSize.height },
                  styles.libraryImage,
                ]}
              />
            )}
          </View>
        </Pressable>
      </Link>
      <Link href={`/tweet/${tweet.id}`} asChild>
        <Pressable style={{ flex: 1 }}>
          <View style={postStyles.footer}>
            <Link href={`/tweet/${tweet.id}`} asChild>
              <Pressable onPress={handleCommentIconClicked}>
                <MaterialCommunityIcon
                  icon="comment-outline"
                  text={tweet.comments_count}
                  iconColor="#b2b2b2"
                  size={22}
                />
              </Pressable>
            </Link>
            <View style={postStyles.likesContainer}>
              <Pressable onPress={() => handleToggleLike(false)}>
                {(tweet.liked_by_user && (
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
                {tweet.likes_count}
              </Text>
              <Pressable onPress={() => handleToggleLike(true)}>
                {(tweet.disliked_by_user && (
                  <AntIcon icon="dislike1" iconColor="red" size={22} />
                )) || <AntIcon icon="dislike2" iconColor="#b2b2b2" size={22} />}
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Link>
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
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  libraryImage: {
    marginTop: 10,
    borderRadius: 8,
  },
});

export default Tweet;
