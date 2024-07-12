import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  Text,
  RefreshControl,
  Animated,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import Tweet from "../../../../components/Tweet";
import { Link, SplashScreen } from "expo-router";
import { useTweetsApi } from "../../../../context/TweetContext";
import { useUser } from "../../../../context/UserContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import EmptyListView from "../../../../components/EmptyListView";
import LockedNeighborhoodListView from "../../../../components/LockedNeighborhoodListView";
import pageStyles from "../../../../lib/styles/page";
import { useEffect, useRef, useState } from "react";
import FeedSwitch from "../../../../components/FeedSwitch";
import NeighborhoodScrollPicker from "../../../../components/NeighborhoodScrollPicker";

const FeedScreen = () => {
  const { listTweets, getUsersCountForNeighborhood } = useTweetsApi();
  const [refreshing, setRefreshing] = useState(false);
  const [lastScrollPos, setLastScrollPos] = useState(0);
  const {
    flatListRef,
    isFeedHot,
    updateIsFeedHot,
    user: currentUser,
    activeNeighborhood,
  } = useUser();
  const fadeSwitchAnim = useRef(new Animated.Value(1)).current;
  const fadeNewTweetButtonAnim = useRef(new Animated.Value(1)).current;
  const [switchIsVisible, setSwitchIsVisible] = useState(true);
  const [membersCount, setMembersCount] = useState(0);
  const selectedNeighborhoodsCount =
    currentUser?.selected_neighborhoods?.length ?? 0;

  if (!activeNeighborhood) {
    return <Text>Loading...</Text>;
  }

  const isNeighborhoodLocked = activeNeighborhood.is_locked;

  useEffect(() => {
    const fetchData = async () => {
      await refetch();
    };

    fetchData();
  }, [isFeedHot]);

  useEffect(() => {
    const getUsersCount = async () => {
      const res = await getUsersCountForNeighborhood(activeNeighborhood.id);
      setMembersCount(res?.members_count ?? 0);
    };
    if (isNeighborhoodLocked) {
      getUsersCount();
    }
  }, [activeNeighborhood]);

  const fadeIn = () => {
    setSwitchIsVisible(true);
    Animated.timing(fadeSwitchAnim, {
      toValue: 1,
      duration: 200, // Duration of the fade-in animation
      useNativeDriver: true,
    }).start();
    Animated.timing(fadeNewTweetButtonAnim, {
      toValue: 1,
      duration: 200, // Duration of the fade-in animation
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    setSwitchIsVisible(false);
    Animated.timing(fadeSwitchAnim, {
      toValue: 0,
      duration: 200, // Duration of the fade-out animation
      useNativeDriver: true,
    }).start();
    Animated.timing(fadeNewTweetButtonAnim, {
      toValue: 0.5,
      duration: 200, // Duration of the fade-in animation
      useNativeDriver: true,
    }).start();
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: new Animated.Value(0) } } }],
    {
      listener: (event: any) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const isScrollingUp = currentOffset < lastScrollPos;

        if (isScrollingUp || currentOffset < 40) {
          fadeIn();
        } else {
          fadeOut();
        }
        setLastScrollPos(currentOffset);
      },
      useNativeDriver: false,
    }
  );

  const usePostsInfiniteQuery = (isHot: boolean) => {
    return useInfiniteQuery({
      queryKey: ["infinitetweets", activeNeighborhood.id, isHot],
      queryFn: async ({ pageParam = 0 }) =>
        listTweets(activeNeighborhood.id, pageParam, isHot),
      getNextPageParam: (lastPage, _) => lastPage?.nextCursor,
    });
  };

  const {
    data,
    isFetched,
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  } = usePostsInfiniteQuery(isFeedHot);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!isFetchingNextPage && hasNextPage) fetchNextPage();
  };

  if (isFetched) {
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
  }

  if (error) {
    return <Text>Couldn't Load Posts!</Text>;
  }

  const items = data?.pages.flatMap((page) => page.data) ?? [];
  // Create a new Set to track unique tweet IDs
  const uniqueIds = new Set();
  const uniqueItems = items.filter((tweet) => {
    if (!tweet) return false;

    // if post has the user ID in the hide list, don't show it
    if (tweet.hidden_from_users.includes(currentUser?.id)) {
      return false;
    }

    // if post is from a blocked user, don't show it
    if (currentUser?.blocked_users.includes(tweet.user_id)) {
      return false;
    }

    const isDuplicate = uniqueIds.has(tweet.id);
    // Add the ID to the Set if it's not already there
    if (!isDuplicate) {
      uniqueIds.add(tweet.id);
      return true;
    } else {
      return false;
    }
  });

  return (
    <View style={pageStyles.page}>
      <Animated.View
        pointerEvents={switchIsVisible ? "auto" : "none"}
        style={[
          {
            opacity: fadeSwitchAnim,
            zIndex: 1,
          },
        ]}
      >
        <NeighborhoodScrollPicker />
      </Animated.View>
      {isNeighborhoodLocked ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={[]}
          renderItem={() => null}
          ListEmptyComponent={() =>
            LockedNeighborhoodListView({
              membersCount,
            })
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          keyExtractor={(item) => item.id}
          ref={flatListRef}
          data={uniqueItems}
          renderItem={({ item }) => (
            <Tweet
              tweet={item}
              allowPush={true}
              handleCommentIconClicked={() => console.log("comment clicked")}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? () => <ActivityIndicator size="small" /> : null
          }
          ListHeaderComponent={
            selectedNeighborhoodsCount
              ? () => <View style={{ height: 45, backgroundColor: "white" }} />
              : null
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() =>
            EmptyListView("post something that’s on your mind.")
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
      <Animated.View
        pointerEvents={switchIsVisible ? "auto" : "none"}
        style={[
          {
            opacity: fadeSwitchAnim,
          },
        ]}
      >
        <FeedSwitch isHot={isFeedHot} setIsHot={updateIsFeedHot} />
      </Animated.View>
      <Animated.View
        style={[
          {
            opacity: fadeNewTweetButtonAnim,
          },
        ]}
      >
        <Link href="/new-tweet" asChild>
          <Pressable style={styles.floatingButton}>
            <Entypo name="plus" size={36} color="white" />
          </Pressable>
        </Link>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    backgroundColor: "red",
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
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

export default FeedScreen;
