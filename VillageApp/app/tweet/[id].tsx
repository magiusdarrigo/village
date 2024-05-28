import {
  ActivityIndicator,
  Alert,
  View,
  FlatList,
  KeyboardAvoidingView,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
  Keyboard,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Entypo } from "@expo/vector-icons";
import { useTweetsApi } from "../../context/TweetContext";
import Tweet from "../../components/Tweet";
import { SplashScreen, useLocalSearchParams, usePathname } from "expo-router";
import Comment from "../../components/Comment";
import { CommentType } from "../../types";
import * as Sentry from "sentry-expo";
import { DynaPuffText } from "../../components/StyledText";
import postStyles from "../../lib/styles/post";
import { ScrollView } from "react-native-gesture-handler";
import Colors from "../../constants/Colors";
import { PIXELS_FROM_BOTTOM_TO_TRIGGER_PAGE_LOAD } from "../../lib/api/pagination";
import { useUser } from "../../context/UserContext";
import { DeviceType, getDeviceType } from "../../lib/helpers";

const getVerticalOffset = () => {
  switch (getDeviceType()) {
    case DeviceType.iPhoneSmall:
      return {
        height: 80,
        paddingTop: 20,
      };
    default:
      return {
        height: 100,
        paddingTop: 0,
      };
  }
};

const footerHeight = getVerticalOffset();

const TweetScreen = () => {
  const { tweetId } = useLocalSearchParams();
  const { getTweet, listComments, createComment } = useTweetsApi();
  const queryClient = useQueryClient();
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  const { isFeedHot, user: currentUser, activeNeighborhood } = useUser();

  const [commentText, setCommentText] = useState("");
  const [selectedCommentID, setSelectedCommentID] = useState<
    number | undefined
  >(undefined);

  const isPostButtonDisabled = commentText.length < 1;

  if (activeNeighborhood === null) {
    return <ActivityIndicator />;
  }

  useEffect(() => {
    const keyboardHideListener = Keyboard.addListener(
      "keyboardDidHide",
      _handleKeyboardHide
    );

    return () => {
      keyboardHideListener.remove();
    };
  }, []);

  const _handleKeyboardHide = () => {
    setSelectedCommentID(undefined);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["tweets", tweetId],
    enabled: currentUser !== null,
    queryFn: () => {
      return getTweet(tweetId as string);
    },
  });

  const handleAddComment = async () => {
    try {
      const characterCount = commentText.length;
      if (characterCount < 1 || characterCount > 200) {
        Alert.alert(
          `Your post is ${characterCount} characters long. It needs to be between 1 and 200 characters.`
        );
        return;
      }
      Keyboard.dismiss();
      await mutateAsync({
        postID: String(tweetId),
        textContent: commentText,
        parentCommentID: selectedCommentID
          ? String(selectedCommentID)
          : undefined,
      });
      setCommentText("");
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue publishing your comment.");
    }
  };

  const useCommentsInfiniteQuery = (postId: string) => {
    return useInfiniteQuery({
      queryKey: ["comments", String(postId)],
      enabled: currentUser !== null,
      queryFn: async ({
        pageParam = { lastLikesCount: undefined, lastCommentID: undefined },
      }) => {
        const { lastLikesCount, lastCommentID } = pageParam;
        return listComments(String(postId), lastLikesCount, lastCommentID);
      },
      getNextPageParam: (lastPage) => {
        // Assuming the API response has fields `lastLikesCount` and `lastCommentID`
        const { lastLikesCount, lastCommentID } = lastPage;
        if (lastLikesCount === undefined || lastCommentID === undefined)
          return undefined;
        return { lastLikesCount, lastCommentID };
      },
    });
  };

  const { isLoading: isLoadingCreateComment, mutateAsync } = useMutation({
    mutationFn: createComment,
    onSuccess: (newData) => {
      // update the single tweet cache with a +1 total comments count
      queryClient.setQueryData(["tweets", String(tweetId)], (old: any) => {
        if (!old) return;
        return {
          ...old,
          comments_count: old.comments_count + 1,
        };
      });
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
                  if (tweet.id === Number(tweetId)) {
                    return {
                      ...tweet,
                      comments_count: tweet.comments_count + 1,
                    };
                  }
                  return tweet;
                }),
              };
            }),
          };
        }
      );
      // update the profile tweets list cache with a +1 total comments count for the tweet
      queryClient.setQueryData(
        ["profiletweets", String(data?.user_id)],
        (old: any) => {
          if (!old) return;
          return {
            ...old,
            pages: old.pages.map((page: any) => {
              return {
                ...page,
                data: page.data.map((tweet: any) => {
                  if (tweet.id === Number(tweetId)) {
                    return {
                      ...tweet,
                      comments_count: tweet.comments_count + 1,
                    };
                  }
                  return tweet;
                }),
              };
            }),
          };
        }
      );
      // update the comments cache with the new comment
      queryClient.setQueryData(["comments", String(tweetId)], (old: any) => {
        if (!old) {
          return {
            pageParams: [],
            pages: [
              { data: [newData], lastLikesCount: null, lastCommentID: null },
            ],
          };
        }
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: [newData, ...old.pages[0].data],
            },
            ...old.pages.slice(1),
          ],
        };
      });
    },
    onError: async (error: any) => {
      const err = await error.json();
      if (err?.status === 400) {
        Alert.alert(err?.body?.error);
        return;
      }
      console.log(error);
      Alert.alert("We had an issue publishing your comment. Try again.");
    },
  });

  const {
    data: commentsData,
    isFetching,
    isFetched,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useCommentsInfiniteQuery(String(tweetId));

  const handleLoadMore = () => {
    if (hasNextPage) fetchNextPage();
  };

  if (isLoading || currentUser === null) {
    return <ActivityIndicator />;
  }

  if (isFetched) {
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
  }

  if (error) {
    return Alert.alert(
      "We had an issue getting this post. It might've been deleted."
    );
  }
  const items = commentsData?.pages.flatMap((page) => page.data) ?? [];
  // Create a new Set to track unique tweet IDs
  const uniqueIds = new Set();
  const uniqueItems = items.filter((comment: CommentType) => {
    if (!comment || comment.parent_comment_id) return false;
    const isDuplicate = uniqueIds.has(comment.id);

    // Add the ID to the Set if it's not already there
    if (!isDuplicate) {
      uniqueIds.add(comment.id);
      return true;
    }

    // if comment is from a blocked user, don't show it
    if (currentUser?.blocked_users.includes(comment.user_id)) {
      return false;
    }

    // If it's a duplicate, filter it out
    return false;
  });

  // Add replies to the corresponding parent comment
  items.forEach((comment: CommentType) => {
    if (
      comment?.parent_comment_id &&
      uniqueIds.has(comment.parent_comment_id)
    ) {
      const parentIndex = uniqueItems.findIndex(
        (c) => c.id === comment.parent_comment_id
      );
      if (parentIndex !== -1) {
        // Insert the reply after the parent comment
        uniqueItems.splice(parentIndex + 1, 0, comment);
      }
    }
  });

  const keyboardVerticalOffset = Platform.OS === "ios" ? 64 : 0;

  const handleCreateReply = (commentID: number, index: number | undefined) => {
    if (index === undefined) return;
    inputRef.current?.focus();
    flatListRef.current?.scrollToIndex({ animated: true, index });
    setSelectedCommentID(commentID);
  };

  const handleCommentIconPressed = () => {
    setSelectedCommentID(undefined);
    inputRef.current?.focus();
  };

  const renderEmptyListComponent = () => (
    <View style={postStyles.emptyCommentsContainer}>
      <DynaPuffText style={postStyles.emptyCommentsContainerText}>
        No comments yet.
      </DynaPuffText>
    </View>
  );

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;

    // Check if the user has scrolled to the bottom
    if (
      offsetY + scrollViewHeight >=
      contentHeight - PIXELS_FROM_BOTTOM_TO_TRIGGER_PAGE_LOAD
    ) {
      // 50 is a threshold
      if (!isFetching) {
        handleLoadMore();
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        style={{ flex: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={500}
        keyboardDismissMode="on-drag"
      >
        <Tweet
          tweet={data}
          allowPush={false}
          handleCommentIconClicked={handleCommentIconPressed}
        />
        {items.length > 0 && (
          <View style={styles.postSeperatorContainer}></View>
        )}
        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          ref={flatListRef}
          data={uniqueItems}
          renderItem={({ item, index }) => (
            <Comment
              comment={item}
              index={index}
              handleAddReply={handleCreateReply}
              isSelected={item.id === selectedCommentID}
            />
          )}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage || isFetching || isLoadingCreateComment ? (
              <ActivityIndicator size="small" />
            ) : null
          }
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={renderEmptyListComponent}
          scrollEnabled={false}
        />
      </ScrollView>
      <View style={styles.footer}>
        <TextInput
          ref={inputRef}
          placeholder="Add a comment..."
          placeholderTextColor={"lightgrey"}
          style={styles.footerTextInput}
          onChangeText={setCommentText}
          value={commentText}
        />
        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.addCommentPressable,
              isPostButtonDisabled ? styles.buttonDisabled : {},
            ]}
            onPress={handleAddComment}
            disabled={isPostButtonDisabled}
          >
            <Entypo name="plus" size={18} color="white" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  seperatorText: {
    fontSize: 12,
    color: "grey",
  },
  seperatorTextContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  postSeperatorContainer: {
    display: "flex",
    height: 25,
    backgroundColor: Colors.light.mainBackground,
  },
  buttonContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
  },
  addCommentPressable: {
    backgroundColor: "#050A12",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  footer: {
    flexDirection: "row",
    height: footerHeight.height,
    backgroundColor: "white",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
  },
  footerTextInput: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "white",
    paddingTop: footerHeight.paddingTop,
    padding: 20,
  },
});

export default TweetScreen;
