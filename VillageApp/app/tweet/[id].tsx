import {
  ActivityIndicator,
  Alert,
  View,
  FlatList,
  KeyboardAvoidingView,
  TextInput,
  Text,
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
import { useGlobalSearchParams } from "expo-router";
import Comment from "../../components/Comment";
import { CommentType } from "../../types";

const TweetScreen = () => {
  const { id } = useGlobalSearchParams();
  const { getTweet, listComments, createComment } = useTweetsApi();
  const queryClient = useQueryClient();
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);

  const [commentText, setCommentText] = useState("");
  const [selectedCommentID, setSelectedCommentID] = useState<
    number | undefined
  >(undefined);

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
    queryKey: ["tweets", id],
    queryFn: () => getTweet(id as string),
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
        postID: String(id),
        textContent: commentText,
        parentCommentID: String(selectedCommentID),
      });
      setCommentText("");
    } catch (e: any) {
      console.log("Error creating tweet", e.message);
    }
  };

  const useCommentsInfiniteQuery = (postId: string) => {
    return useInfiniteQuery({
      queryKey: ["comments", String(postId)],
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
      queryClient.setQueryData(["comments", String(id)], (old: any) => {
        if (!old) {
          // If for some reason we don't have the pages, just return a new page structure
          return {
            pageParams: [],
            pages: [
              { data: [newData], lastLikesCount: null, lastCommentID: null },
            ],
          };
        }

        // Otherwise, add the new comment to the beginning of the first page
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
      // convert error to json
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
    error: commentsError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useCommentsInfiniteQuery(String(id));

  const handleLoadMore = () => {
    if (hasNextPage) fetchNextPage();
  };

  if (isLoading) {
    return <ActivityIndicator />;
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

    // If it's a duplicate, filter it out
    return false;
  });

  // Add replies to the corresponding parent comment
  items.forEach((comment: CommentType) => {
    if (comment.parent_comment_id && uniqueIds.has(comment.parent_comment_id)) {
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={{ flex: 1 }}>
        <Tweet tweet={data} />
        <View style={styles.postSeperatorContainer}>
          <View style={styles.seperatorTextContainer}>
            <Text style={styles.seperatorText}>Top Comments</Text>
          </View>
        </View>
        <FlatList
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage || isFetching || isLoadingCreateComment ? (
              <ActivityIndicator size="small" />
            ) : null
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </View>
      <View style={styles.footer}>
        <TextInput
          ref={inputRef}
          placeholder="Add a comment..."
          style={styles.footerTextInput}
          onChangeText={setCommentText}
          value={commentText}
        />
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.addCommentPressable}
            onPress={handleAddComment}
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
    backgroundColor: "white",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "lightgrey",
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
  footer: {
    flexDirection: "row",
    height: 100,
    backgroundColor: "white",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
  },
  footerTextInput: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "white",
    paddingTop: 0,
    padding: 20,
  },
});

export default TweetScreen;
