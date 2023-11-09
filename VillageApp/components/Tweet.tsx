import { View, Text, Image, StyleSheet, Pressable, Alert } from "react-native";
import { useState } from "react";
import { TweetType } from "../types";
import { Entypo } from "@expo/vector-icons";
import { EvilIcon, AntIcon } from "./Icons";
import { Link, useNavigation, useSegments } from "expo-router";
import { useTweetsApi } from "../lib/api/tweets";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "../context/UserContext";

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
      onError: (error) => {
        Alert.alert("We couldn't like this post. Try again.");
      },
    }
  );

  // unlike a tweet
  const { mutate: mutateUnlike, isLoading: isLoadingUnlike } = useMutation(
    unlikeTweet,
    {
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
      onError: (error) => {
        Alert.alert("We couldn't like this post. Try again.");
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
      Alert.alert("We couldn't delete this post. Try again.");
    },
  });

  const onReport = async (id: number) => {
    try {
      await reportTweet(String(id));
      Alert.alert("Post reported.");
    } catch (error) {
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
              <Pressable style={styles.iconWrapper}>
                <EvilIcon icon="comment" text={tweet.comments_count} />
              </Pressable>
              <Pressable
                style={styles.iconWrapper}
                onPress={() => handleToggleLike(tweet.id)}
              >
                {(tweet.liked_by_user && (
                  <AntIcon
                    icon="heart"
                    text={tweet.likes_count}
                    iconColor="red"
                  />
                )) || (
                  <AntIcon
                    icon="hearto"
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
    width: 120,
    justifyContent: "space-between",
  },
  iconWrapper: {},
});

export default Tweet;
