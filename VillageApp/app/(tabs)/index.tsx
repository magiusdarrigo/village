import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  Text,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import Tweet from "../../components/Tweet";
import { Link } from "expo-router";
import { useTweetsApi } from "../../context/TweetContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { DynaPuffText } from "../../components/StyledText";
import postStyles from "../../lib/styles/post";

export default function FeedScreen() {
  const { listTweets } = useTweetsApi();

  const {
    data,
    isFetching,
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["tweets"],
    queryFn: async ({ pageParam = 0 }) => listTweets(pageParam),
    getNextPageParam: (lastPage, _) => lastPage?.nextCursor,
    getPreviousPageParam: (firstPage, _) => firstPage.prevCursor,
  });

  const handleLoadMore = () => {
    if (hasNextPage) fetchNextPage();
  };

  if (isFetching && !isFetchingNextPage) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Couldn't Load Posts!</Text>;
  }

  const items = data?.pages.flatMap((page) => page.data) ?? [];
  // Create a new Set to track unique tweet IDs
  const uniqueIds = new Set();
  const uniqueItems = items.filter((tweet) => {
    if (!tweet) return false;
    const isDuplicate = uniqueIds.has(tweet.id);

    // Add the ID to the Set if it's not already there
    if (!isDuplicate) {
      uniqueIds.add(tweet.id);
      return true;
    }

    // If it's a duplicate, filter it out
    return false;
  });

  const renderEmptyListComponent = () => (
    <View style={postStyles.emptyPostsContainer}>
      <DynaPuffText style={postStyles.emptyPostsContainerText}>
        Post something that’s on your mind.
      </DynaPuffText>
    </View>
  );

  return (
    <View style={styles.page}>
      <FlatList
        data={uniqueItems}
        renderItem={({ item }) => (
          <Tweet
            tweet={item}
            handleCommentIconClicked={() => console.log("comment clicked")}
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? () => <ActivityIndicator size="small" /> : null
        }
        ListEmptyComponent={renderEmptyListComponent}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      <Link href="/new-tweet" asChild>
        <Pressable style={styles.floatingButton}>
          <Entypo name="plus" size={32} color="white" />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "white",
  },
  floatingButton: {
    backgroundColor: "black",
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    // shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
});
