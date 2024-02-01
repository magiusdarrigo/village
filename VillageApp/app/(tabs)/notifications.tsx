import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import pageStyles from "../../lib/styles/page";
import EmptyListView from "../../components/EmptyListView";
import { useState, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTweetsApi } from "../../context/TweetContext";
import Notification from "../../components/Notification";

const NotificationsScreen = () => {
  const { listNotifications } = useTweetsApi();
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const useNotificationsInfiniteQuery = () => {
    return useInfiniteQuery({
      queryKey: ["notifications"],
      queryFn: async ({ pageParam = 0 }) => listNotifications(pageParam),
      getNextPageParam: (lastPage, _) => lastPage?.nextCursor,
    });
  };

  const {
    data,
    isFetching,
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  } = useNotificationsInfiniteQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasNextPage) fetchNextPage();
  };

  if (error) {
    return <Text>Couldn't Load Notifications!</Text>;
  }

  const items = data?.pages.flatMap((page) => page.data) ?? [];
  const uniqueIds = new Set();
  const uniqueItems = items.filter((notification) => {
    if (!notification) return false;
    const isDuplicate = uniqueIds.has(notification.id);
    if (!isDuplicate) {
      uniqueIds.add(notification.id);
      return true;
    }
    return false;
  });

  return (
    <View style={pageStyles.page}>
      {/* <NeighborhoodScrollPicker /> */}
      <FlatList
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        ref={flatListRef}
        data={uniqueItems}
        renderItem={({ item }) => <Notification notification={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? () => <ActivityIndicator size="small" /> : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => EmptyListView("No Notifications Yet.")}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
};

export default NotificationsScreen;
