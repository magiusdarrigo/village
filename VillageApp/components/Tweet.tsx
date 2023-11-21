import { View, Text, Image, StyleSheet, Pressable, Alert } from "react-native";
import { useState } from "react";
import { TweetType } from "../types";
import { Entypo } from "@expo/vector-icons";
import { AntIcon, MaterialCommunityIcon } from "./Icons";
import { Link, useNavigation, useSegments } from "expo-router";
import { useTweetsApi } from "../context/TweetContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "../context/UserContext";
import { calculateHoursAgo } from "../lib/helpers";
import * as Sentry from "sentry-expo";

type TweetProps = {
  tweet: TweetType;
  handleCommentIconClicked: () => void;
};

const Tweet = ({ tweet, handleCommentIconClicked }: TweetProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { likeTweet, unlikeTweet, deleteTweet, reportTweet } = useTweetsApi();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const segments = useSegments();
  const { user } = useUser();
  if (!user) {
    Alert.alert("Something went wrong. Try again.");
    return null;
  }

  // like a tweet
  const { mutate: mutateLike, isLoading: isLoadingLike } = useMutation(
    likeTweet,
    {
      onMutate: async (postID: string) => {
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
            liked_by_user: true,
            likes_count: old?.likes_count + 1,
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
                        liked_by_user: true,
                        likes_count: tweet.likes_count + 1,
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
            liked_by_user: true,
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
                        liked_by_user: true,
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

  // unlike a tweet
  const { mutate: mutateUnlike, isLoading: isLoadingUnlike } = useMutation(
    unlikeTweet,
    {
      onMutate: async (postID: string) => {
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
            likes_count: old?.likes_count - 1,
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
                        likes_count: tweet.likes_count - 1,
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
          onPress: () => console.log("Cancel Pressed"),
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
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          { text: "Yes", onPress: () => mutateDelete(String(tweet.id)) },
        ]
      );
    }
  };

  const handleToggleLike = async (postID: number) => {
    try {
      if (isLoadingLike || isLoadingUnlike) return;
      if (tweet.liked_by_user) {
        mutateUnlike(String(postID));
      } else {
        mutateLike(String(postID));
      }
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We couldn't like this post. Try again.");
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
            <View
              // source={{ uri: tweet.profile_image }}
              style={[
                styles.userImage,
                { backgroundColor: tweet.profile_image },
              ]}
            />
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
              <Text style={styles.username}>@{tweet.username}</Text>
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

            <Text style={styles.content}> {tweet.text_content}</Text>

            {tweet.image_url && (
              <Image source={{ uri: tweet.image_url }} style={styles.image} />
            )}

            <View style={styles.footer}>
              <Link href={`/tweet/${tweet.id}`} asChild>
                <Pressable onPress={handleCommentIconClicked}>
                  <MaterialCommunityIcon
                    icon="comment-outline"
                    text={tweet.comments_count}
                    iconColor="#b2b2b2"
                  />
                </Pressable>
              </Link>
              <Pressable onPress={() => handleToggleLike(tweet.id)}>
                {(tweet.liked_by_user && (
                  <AntIcon
                    icon="like1"
                    text={tweet.likes_count}
                    iconColor="red"
                  />
                )) || (
                  <AntIcon
                    icon="like2"
                    text={tweet.likes_count}
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
});

export default Tweet;
