import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { TweetType } from "../types";
import { Entypo } from "@expo/vector-icons";
import { AntIcon, IoniconsIcon, MaterialCommunityIcon } from "./Icons";
import { Link, useNavigation, useSegments } from "expo-router";
import { useTweetsApi } from "../context/TweetContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "../context/UserContext";
import { calculateHoursAgo, blurhash } from "../lib/helpers";
import * as Sentry from "sentry-expo";
import postStyles from "../lib/styles/post";
import Hyperlink from "react-native-hyperlink";
import { handlePressButtonAsync } from "../lib/helpers";
import Colors from "../constants/Colors";
import { AlertButton } from "react-native";
import * as Sharing from "expo-sharing";

type TweetProps = {
  tweet: TweetType;
  handleCommentIconClicked: () => void;
};

const { width: phoneWidth } = Dimensions.get("window");

const Tweet = ({ tweet, handleCommentIconClicked }: TweetProps) => {
  const { likeTweet, unlikeTweet, deleteTweet, reportTweet, hideTweet } =
    useTweetsApi();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const segments = useSegments();
  const { user, isFeedHot } = useUser();
  if (!user) {
    Alert.alert("Something went wrong. Try again.");
    return null;
  }

  const onShare = async () => {
    try {
      await Sharing.shareAsync(
        `https://api.villageapp.nyc/tweet/${tweet.id}?tweetId=${tweet.id}`
      );
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We couldn't share this post. Try again.");
    }
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
          queryClient.cancelQueries(["infinitetweets", isFeedHot]),
          queryClient.cancelQueries(["profiletweets", String(tweet.user_id)]),
        ]);

        // snapshot the previous value
        const previousTweets = queryClient.getQueryData([
          "infinitetweets",
          isFeedHot,
        ]);
        const previousTweet = queryClient.getQueryData([
          "tweets",
          String(tweet.id),
        ]);
        const previousProfileTweets = queryClient.getQueryData([
          "profiletweets",
          String(tweet.user_id),
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
        queryClient.setQueryData(["infinitetweets", isFeedHot], (old: any) => {
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
        queryClient.setQueryData(
          ["profiletweets", String(tweet.user_id)],
          (old: any) => {
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
          }
        );

        // return a context object with the snapshotted values
        return { previousTweets, previousTweet, previousProfileTweets };
      },
      onError: (error, _, context) => {
        Sentry.Native.captureException(error);
        Alert.alert("We couldn't like this post. Try again.");

        // revert to the previous value
        if (context?.previousTweets) {
          queryClient.setQueryData(
            ["infinitetweets", isFeedHot],
            context.previousTweets
          );
        }
        if (context?.previousTweet) {
          queryClient.setQueryData(
            ["tweets", String(tweet.id)],
            context.previousTweet
          );
        }
        if (context?.previousProfileTweets) {
          queryClient.setQueryData(
            ["profiletweets", String(tweet.user_id)],
            context.previousProfileTweets
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
          queryClient.cancelQueries(["infinitetweets", isFeedHot]),
          queryClient.cancelQueries(["profiletweets", String(tweet.user_id)]),
        ]);

        // snapshot the previous values
        const previousTweets = queryClient.getQueryData([
          "infinitetweets",
          isFeedHot,
        ]);
        const previousTweet = queryClient.getQueryData([
          "tweets",
          String(tweet.id),
        ]);
        const previousProfileTweets = queryClient.getQueryData([
          "profiletweets",
          String(user.id),
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
        queryClient.setQueryData(["infinitetweets", isFeedHot], (old: any) => {
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
        queryClient.setQueryData(
          ["profiletweets", String(tweet.user_id)],
          (old: any) => {
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
          }
        );

        // return a context object with the snapshotted values
        return { previousTweets, previousTweet, previousProfileTweets };
      },
      onError: (error, _, context) => {
        Sentry.Native.captureException(error);
        Alert.alert("We couldn't like this post. Try again.");
        // revert to the previous value
        if (context?.previousTweets) {
          queryClient.setQueryData(
            ["infinitetweets", isFeedHot],
            context.previousTweets
          );
        }
        if (context?.previousTweet) {
          queryClient.setQueryData(
            ["tweets", String(tweet.id)],
            context.previousTweet
          );
        }
        if (context?.previousProfileTweets) {
          queryClient.setQueryData(
            ["profiletweets", String(tweet.user_id)],
            context.previousProfileTweets
          );
        }
      },
    }
  );

  // delete a tweet
  const { mutate: mutateDelete } = useMutation(deleteTweet, {
    onSuccess: (data) => {
      // update the list of tweets in the cache
      queryClient.setQueryData(["infinitetweets", isFeedHot], (old: any) => {
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
      queryClient.setQueryData(
        ["profiletweets", String(tweet.user_id)],
        (old: any) => {
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
        }
      );
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

  // hide a tweet
  const { mutate: mutateHide } = useMutation(hideTweet, {
    onSuccess: (data) => {
      // update the list of tweets in the cache
      queryClient.setQueryData(["infinitetweets", isFeedHot], (old: any) => {
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
      queryClient.setQueryData(
        ["profiletweets", String(tweet.user_id)],
        (old: any) => {
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
        }
      );
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

  const onHide = async (id: number) => {
    try {
      mutateHide(String(id));
      Alert.alert("Post hidden.");
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We couldn't hide this post. Try again.");
    }
  };

  const handle3DotsPressed = (userID: string, tweet: TweetType) => {
    const alertOptions: AlertButton[] = [
      {
        text: "Cancel",
        style: "cancel",
      },
    ];

    if (userID !== tweet.user_id) {
      // If the current user is not the author of the post
      alertOptions.push(
        { text: "Report", onPress: () => onReport(tweet.id) },
        { text: "Hide", onPress: () => onHide(tweet.id) } // Add Hide option here
      );
    } else {
      // If the current user is the author of the post
      alertOptions.push({
        text: "Delete",
        onPress: () => mutateDelete(String(tweet.id)),
      });
    }

    Alert.alert(
      userID !== tweet.user_id ? "Harmful Post?" : "Delete Post?",
      userID !== tweet.user_id
        ? ""
        : "Are you sure you want to delete this post?",
      alertOptions
    );
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

  const imageSize = { width: 0, height: 0 };
  if (tweet.image_url) {
    const postWidth = phoneWidth - 20;
    const aspectRatio = tweet.image_width / tweet.image_height;
    const scaledHeight = postWidth / aspectRatio;
    imageSize.width = postWidth;
    imageSize.height = scaledHeight;
  }

  return (
    <View style={postStyles.parentContainer}>
      <View style={postStyles.imageParentContainer}>
        <View style={postStyles.imageContainer}>
          <Link
            href={{
              pathname: `/profile/${tweet.user_id}`,
              params: {
                // TODO: no need to make userID a query param too, just extract id with useParams hook in profileScreen
                userID: tweet.user_id,
                username: tweet.username,
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
              <View style={styles.userImage}>
                <Image source={tweet.profile_image} style={styles.userImage} />
              </View>
            </Pressable>
          </Link>
          <Link href={`/tweet/${tweet.id}?tweetId=${tweet.id}`} push asChild>
            <Pressable style={{ flex: 1 }}></Pressable>
          </Link>
        </View>
        <Link href={`/tweet/${tweet.id}?tweetId=${tweet.id}`} push asChild>
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
      <Link href={`/tweet/${tweet.id}?tweetId=${tweet.id}`} push asChild>
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
                placeholder={blurhash}
                style={[
                  { width: imageSize.width, height: imageSize.height },
                  styles.libraryImage,
                ]}
              />
            )}
          </View>
        </Pressable>
      </Link>
      <Link href={`/tweet/${tweet.id}?tweetId=${tweet.id}`} push asChild>
        <Pressable style={{ flex: 1 }}>
          <View style={postStyles.postFooter}>
            <Link href={`/tweet/${tweet.id}?tweetId=${tweet.id}`} push asChild>
              <Pressable
                onPress={handleCommentIconClicked}
                style={{ paddingTop: 3.5 }}
              >
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
            <Pressable
              style={{ marginLeft: 8, paddingBottom: 3 }}
              onPress={() => onShare()}
            >
              <IoniconsIcon
                icon="share-outline"
                iconColor="#b2b2b2"
                size={24}
              />
            </Pressable>
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
