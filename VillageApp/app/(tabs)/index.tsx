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
import { useTweetsApi } from "../../lib/api/tweets";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import colors from "../../constants/Colors";

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
    getNextPageParam: (lastPage, allPages) => lastPage.nextCursor,
    getPreviousPageParam: (firstPage, allPages) => firstPage.prevCursor,
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

  return (
    <View style={styles.page}>
      <FlatList
        data={items}
        renderItem={({ item }) => <Tweet tweet={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? () => <ActivityIndicator size="large" /> : null
        }
      />

      <Link href="/new-tweet" asChild>
        <Pressable style={styles.floatingButton}>
          <Entypo name="plus" size={24} color="black" />
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
    backgroundColor: colors.light.tertiary,
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
