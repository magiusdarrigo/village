import {
  ActivityIndicator,
  Alert,
  View,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useTweetsApi } from "../../lib/api/tweets";
import Tweet from "../../components/Tweet";
import { useGlobalSearchParams } from "expo-router";
import Comment from "../../components/Comment";
import { CommentType } from "../../types";

const TweetScreen = () => {
  const { id } = useGlobalSearchParams();
  const { getTweet, listComments } = useTweetsApi();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tweets", id],
    queryFn: () => getTweet(id as string),
  });

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

  return (
    <KeyboardAvoidingView>
      <Tweet tweet={data} />
      <FlatList
        data={uniqueItems}
        renderItem={({ item }) => <Comment comment={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? () => <ActivityIndicator size="large" /> : null
        }
      />
    </KeyboardAvoidingView>
  );
};

export default TweetScreen;
