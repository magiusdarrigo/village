import React, { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { UserType } from "../types/index";
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useTweetsApi } from "../context/TweetContext";
import EmptyListView from "./EmptyListView";
import { useUser } from "../context/UserContext";
import { handleChooseCustomImage } from "../lib/helpers";
import { MaterialCommunityIcon } from "./Icons";
import * as Sentry from "sentry-expo";
import { PIXELS_FROM_BOTTOM_TO_TRIGGER_PAGE_LOAD } from "../lib/api/pagination";
import Tweet from "./Tweet";
import Colors from "../constants/Colors";
import ProfilesListModal from "./ProfilesListModal";

type ProfileProps = {
  user: UserType;
};

const Profile = ({ user }: ProfileProps) => {
  const queryClient = useQueryClient();
  const {
    followUser,
    unFollowUser,
    updateUserAttributes,
    listTweetsForProfile,
    listUserFollowers,
    listUserFollowing,
  } = useTweetsApi();
  const { user: currentUser, updateUser } = useUser();
  const [profileEditLoading, setProfileEditLoading] = React.useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const usersProfile = currentUser?.id === user.id;

  const onRefresh = async () => {
    setRefreshing(true);
    await isRefetchingTweets();
    setRefreshing(false);
  };

  const useProfileFollowingInfiniteQuery = () => {
    return useInfiniteQuery({
      queryKey: ["profilefollowing", String(user.id)],
      queryFn: async ({ pageParam = 0 }) =>
        listUserFollowing(user.id, pageParam),
      getNextPageParam: (lastPage, _) => lastPage?.nextCursor,
    });
  };

  const {
    data: profileFollowingData,
    fetchNextPage: fetchNextFollowingPage,
    isFetchingNextPage: isFetchingNextFollowingPage,
    hasNextPage: hasNextFollowingPage,
  } = useProfileFollowingInfiniteQuery();

  const handleLoadMoreFollowing = () => {
    if (hasNextFollowingPage) fetchNextFollowingPage();
  };

  const following =
    profileFollowingData?.pages.flatMap((page) => page.data) ?? [];

  const useProfileFollowersInfiniteQuery = () => {
    return useInfiniteQuery({
      queryKey: ["profilefollowers", String(user.id)],
      queryFn: async ({ pageParam = 0 }) =>
        listUserFollowers(user.id, pageParam),
      getNextPageParam: (lastPage, _) => lastPage?.nextCursor,
    });
  };

  const {
    data: profileFollowersData,
    fetchNextPage: fetchNextFollowersPage,
    isFetchingNextPage: isFetchingNextFollowersPage,
    hasNextPage: hasNextFollowersPage,
  } = useProfileFollowersInfiniteQuery();

  const handleLoadMoreFollowers = () => {
    if (hasNextFollowersPage) fetchNextFollowersPage();
  };

  const handleMoreProfiles = () => {
    if (modalTitle === "Followers") {
      handleLoadMoreFollowers();
    } else {
      handleLoadMoreFollowing();
    }
  };

  const followers =
    profileFollowersData?.pages.flatMap((page) => page.data) ?? [];

  const useProfileTweetsInfiniteQuery = () => {
    return useInfiniteQuery({
      queryKey: ["profiletweets", String(user.id)],
      queryFn: async ({ pageParam = 0 }) =>
        listTweetsForProfile(user.id, pageParam),
      getNextPageParam: (lastPage, _) => lastPage?.nextCursor,
    });
  };

  const {
    data: profileTweetsData,
    isFetching: isFetchingTweets,
    refetch: isRefetchingTweets,
    fetchNextPage: fetchNextTweetsPage,
    isFetchingNextPage: isFetchingNextTweetsPage,
    hasNextPage: hasNextTweetsPage,
  } = useProfileTweetsInfiniteQuery();

  const postItems = profileTweetsData?.pages.flatMap((page) => page.data) ?? [];
  // Create a new Set to track unique tweet IDs
  const uniquePostIds = new Set();
  const uniquePostItems = postItems.filter((tweet) => {
    if (!tweet) return false;

    // if post has the current user ID in the hide list, don't show it
    if (tweet.hidden_from_users.includes(currentUser?.id)) {
      return false;
    }

    // if post is from a blocked user, don't show it
    if (currentUser?.blocked_users.includes(tweet.user_id)) {
      return false;
    }

    const isDuplicate = uniquePostIds.has(tweet.id);
    // Add the ID to the Set if it's not already there
    if (!isDuplicate) {
      uniquePostIds.add(tweet.id);
      return true;
    } else {
      return false;
    }
  });

  const handleLoadMoreTweets = () => {
    if (hasNextTweetsPage) fetchNextTweetsPage();
  };

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
      if (!isFetchingTweets) {
        handleLoadMoreTweets();
      }
    }
  };

  const { mutate: mutateFollowUser, isLoading: isLoadingFollow } = useMutation(
    followUser,
    {
      onSuccess: (data) => {
        console.log("onSuccess data", data);
        queryClient.setQueryData(["profiles", String(user.id)], (_: any) => {
          return {
            ...data,
            followed_by_user: true,
          };
        });
      },
      onError: (error) => {
        console.log(error);
        Alert.alert("We had an issue following this user. Try again.");
      },
    }
  );

  const { mutate: mutateUnfollowUser, isLoading: isLoadingUnfollow } =
    useMutation(unFollowUser, {
      onSuccess: (data) => {
        queryClient.setQueryData(["profiles", String(user.id)], (_: any) => {
          return {
            ...data,
            followed_by_user: false,
          };
        });
      },
      onError: (error) => {
        console.log(error);
        Alert.alert("We had an issue unfollowing this user. Try again.");
      },
    });

  const handleFollowUser = () => {
    if (isLoadingFollow || isLoadingUnfollow) {
      return;
    }
    mutateFollowUser(String(user.id));
  };

  const handleUnfollowUser = () => {
    if (isLoadingFollow || isLoadingUnfollow) {
      return;
    }
    mutateUnfollowUser(String(user.id));
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleUpdateProfilePic = async () => {
    try {
      const newImage = await handleChooseCustomImage();
      if (!newImage) {
        // User cancelled
        return;
      }
      setProfileEditLoading(true);
      const updatedUser = await updateUserAttributes({
        profileImage: newImage,
      });
      setProfileEditLoading(false);
      setIsEditingProfile(false);
      updateUser(updatedUser);
    } catch (error) {
      setProfileEditLoading(false);
      setIsEditingProfile(false);
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue uploading your image. Try again.");
    }
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
  };

  return (
    <ScrollView
      style={styles.container}
      onScroll={handleScroll}
      scrollEventThrottle={500}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {profileEditLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        <View style={styles.profileHeader}>
          <View style={styles.profilePhoto}>
            <Image
              source={user.image}
              contentFit="cover"
              style={{ width: 120, height: 120, borderRadius: 60 }}
            />
            {usersProfile && isEditingProfile && (
              <TouchableOpacity
                style={[
                  styles.cameraIconContainer,
                  user.image ? { opacity: 0.25 } : { opacity: 0.35 },
                ]}
                onPress={handleUpdateProfilePic}
              >
                <MaterialCommunityIcon
                  icon="camera-outline"
                  size={40}
                  iconColor="white"
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.bio}>Lives in {user.neighborhood?.name}</Text>
          <View style={styles.countContainer}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
                setModalTitle("Following");
              }}
            >
              <Text style={styles.countText}>
                Following: {user.following_count ?? ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
                setModalTitle("Followers");
              }}
            >
              <Text style={styles.countText}>
                Followers: {user.followers_count ?? ""}
              </Text>
            </TouchableOpacity>
          </View>
          {usersProfile ? (
            <>
              {!isEditingProfile ? (
                <Pressable
                  style={styles.followButton}
                  onPress={handleEditProfile}
                >
                  <Text style={styles.followButtonText}>Edit Profile</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.cancelButton}
                  onPress={handleCancelEditProfile}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              )}
            </>
          ) : (
            <View style={styles.followButtonContainer}>
              {user.followed_by_user ? (
                <Pressable
                  style={styles.unfollowButton}
                  onPress={handleUnfollowUser}
                >
                  <Text style={styles.unfollowButtonText}>Following</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.followButton}
                  onPress={handleFollowUser}
                >
                  <Text style={styles.followButtonText}>Follow</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}
      <View style={styles.tweetsContainer}>
        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          ref={flatListRef}
          data={uniquePostItems}
          renderItem={({ item }) => (
            <Tweet
              tweet={item}
              handleCommentIconClicked={() => console.log("comment clicked")}
              allowPush={true}
            />
          )}
          onEndReached={handleLoadMoreTweets}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextTweetsPage
              ? () => <ActivityIndicator size="small" />
              : null
          }
          ListEmptyComponent={() => EmptyListView("No posts yet.")}
          contentContainerStyle={{ flexGrow: 1 }}
          scrollEnabled={false}
        />
      </View>
      <ProfilesListModal
        isVisible={modalVisible}
        profiles={modalTitle === "Followers" ? followers : following}
        onClose={() => {
          // console.log("closing modal");
          setModalVisible(false);
        }}
        modalTitle={modalTitle}
        handleLoadMoreProfiles={handleMoreProfiles}
        isFetchingNextProfilesPage={
          modalTitle === "Followers"
            ? isFetchingNextFollowersPage
            : isFetchingNextFollowingPage
        }
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bio: {
    lineHeight: 20,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.switchFontColor,
  },
  followButtonContainer: {
    backgroundColor: "transparent",
  },
  followButton: {
    marginVertical: 8,
    backgroundColor: "black",
    borderRadius: 50,
    padding: 5,
    paddingHorizontal: 15,
    width: 120,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  followButtonText: {
    fontWeight: "600",
    color: "white",
    fontSize: 14,
  },
  unfollowButton: {
    marginVertical: 8,
    backgroundColor: "transparent",
    borderRadius: 50,
    padding: 5,
    paddingHorizontal: 15,
    borderColor: "lightgrey",
    borderWidth: 1,
    width: 120,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  unfollowButtonText: {
    fontWeight: "600",
    color: "black",
    fontSize: 14,
  },
  cancelButton: {
    marginVertical: 8,
    backgroundColor: "transparent",
    borderRadius: 50,
    padding: 5,
    paddingHorizontal: 15,
    borderColor: "lightgrey",
    borderWidth: 1,
    width: 120,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontWeight: "600",
    color: Colors.light.cancelRed,
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  profileHeader: {
    alignItems: "center",
    marginVertical: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIconContainer: {
    position: "absolute",
    backgroundColor: "black",
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    paddingTop: 2,
    paddingLeft: 6,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  countContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 8,
  },
  countText: {
    fontSize: 16,
  },
  tweetsContainer: {
    flex: 1,
  },
  tweet: {
    width: "90%",
    backgroundColor: "lightgrey",
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
  },
});

export default Profile;
