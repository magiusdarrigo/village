import {
  ActivityIndicator,
  Alert,
  View,
  FlatList,
  KeyboardAvoidingView,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";
import { useState, useRef } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Entypo } from "@expo/vector-icons";
import { useTweetsApi } from "../../lib/api/tweets";
import Tweet from "../../components/Tweet";
import { useGlobalSearchParams } from "expo-router";
import Comment from "../../components/Comment";
import { CommentType } from "../../types";

const TweetScreen = () => {
  const { id } = useGlobalSearchParams();
  const { getTweet, listComments } = useTweetsApi();

  const [commentText, setCommentText] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["tweets", id],
    queryFn: () => getTweet(id as string),
  });

  const handleAddComment = () => {
    // Logic to add a comment goes here
    console.log(commentText);
    setCommentText("");
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={{ flex: 1 }}>
        <Tweet tweet={data} />
        <FlatList
          data={uniqueItems}
          renderItem={({ item }) => <Comment comment={item} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator size="large" /> : null
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </View>
      <View style={styles.footer}>
        <TextInput
          placeholder="Add a comment..."
          style={styles.footerTextInput}
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
