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
import Tweet from "../../../components/Tweet";
import { Link, SplashScreen, router, usePathname } from "expo-router";
import { useTweetsApi } from "../../../context/TweetContext";
import { useUser } from "../../../context/UserContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import EmptyListView from "../../../components/EmptyListView";
import pageStyles from "../../../lib/styles/page";
import { useEffect, useRef, useState } from "react";
import FeedSwitch from "../../../components/FeedSwitch";
import NeighborhoodScrollPicker from "../../../components/NeighborhoodScrollPicker";

const FeedScreen = () => {
  const { listTweets } = useTweetsApi();
  const [refreshing, setRefreshing] = useState(false);
  const [lastScrollPos, setLastScrollPos] = useState(0);
  const {
    flatListRef,
    isFeedHot,
    updateIsFeedHot,
    user: currentUser,
  } = useUser();
  const fadeSwitchAnim = useRef(new Animated.Value(1)).current;
  const fadeNewTweetButtonAnim = useRef(new Animated.Value(1)).current;
  const [switchIsVisible, setSwitchIsVisible] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await refetch();
    };

    fetchData();
  }, [isFeedHot]);

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
      queryKey: ["infinitetweets", isHot],
      queryFn: async ({ pageParam = 0 }) => listTweets(pageParam, isHot),
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
    if (hasNextPage) fetchNextPage();
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
      {/* <NeighborhoodScrollPicker /> */}
      <FlatList
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        keyExtractor={(item) => item.id}
        ref={flatListRef}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() =>
          EmptyListView("Post something that’s on your mind.")
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
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
    backgroundColor: "black",
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
