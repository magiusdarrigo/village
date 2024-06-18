import React, { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
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
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTweetsApi } from "../context/TweetContext";
import EmptyListView from "./EmptyListView";
import { useUser } from "../context/UserContext";
import { handleChooseCustomImage } from "../lib/helpers";
import { MaterialCommunityIcon } from "./Icons";
import * as Sentry from "sentry-expo";
import { PIXELS_FROM_BOTTOM_TO_TRIGGER_PAGE_LOAD } from "../lib/api/pagination";
import Tweet from "./Tweet";
import ProfilesListModal from "./ProfilesListModal";
import { useFollowUser, useUnfollowUser } from "../mutations/Followers";
import profileStyles from "../lib/styles/profile";

type ProfileProps = {
  user: UserType;
};

const Profile = ({ user }: ProfileProps) => {
  const {
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
      queryKey: ["profilefollowing", user.id],
      queryFn: async ({ pageParam = 0 }) =>
        listUserFollowing(user.id, pageParam),
      getNextPageParam: (lastPage, _) => lastPage?.nextCursor,
    });
  };

  const followUserMutation = useFollowUser();
  const unfollowUserMutation = useUnfollowUser();

  const {
    data: profileFollowingData,
    fetchNextPage: fetchNextFollowingPage,
    isFetchingNextPage: isFetchingNextFollowingPage,
    hasNextPage: hasNextFollowingPage,
    refetch: isRefetchingFollowing,
  } = useProfileFollowingInfiniteQuery();

  const handleLoadMoreFollowing = () => {
    if (hasNextFollowingPage) fetchNextFollowingPage();
  };

  const following =
    profileFollowingData?.pages.flatMap((page) => page.data) ?? [];

  const useProfileFollowersInfiniteQuery = () => {
    return useInfiniteQuery({
      queryKey: ["profilefollowers", user.id],
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
    refetch: isRefetchingFollowers,
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
      queryKey: ["profiletweets", user.id],
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

  const handleFollowUser = () => {
    if (followUserMutation.isLoading || unfollowUserMutation.isLoading) {
      return;
    }
    followUserMutation.mutate({
      userIDToFollow: user.id,
      userIDOfProfile: user.id,
    });
  };

  const handleUnfollowUser = () => {
    if (followUserMutation.isLoading || unfollowUserMutation.isLoading) {
      return;
    }
    unfollowUserMutation.mutate({
      userIDToUnfollow: user.id,
      userIDOfProfile: user.id,
    });
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
      updateUser(updatedUser);
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue uploading your image. Try again.");
    } finally {
      setProfileEditLoading(false);
      setIsEditingProfile(false);
    }
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
  };

  const isWaitlisted = user.neighborhood?.name === "WAITLISTED";

  return (
    <ScrollView
      style={profileStyles.container}
      onScroll={handleScroll}
      scrollEventThrottle={500}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {profileEditLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        <View style={profileStyles.profileHeader}>
          <View style={profileStyles.profilePhoto}>
            <Image
              source={user.image}
              contentFit="cover"
              style={{ width: 120, height: 120, borderRadius: 60 }}
            />
            {usersProfile && isEditingProfile && (
              <TouchableOpacity
                style={[
                  profileStyles.cameraIconContainer,
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
          <Text style={profileStyles.username}>@{user.username}</Text>
          <Text style={profileStyles.bio}>
            {!isWaitlisted
              ? `lives in ${user.neighborhood?.name}`
              : "on the waitlist"}
          </Text>
          <View style={profileStyles.countContainer}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
                setModalTitle("Following");
                isRefetchingFollowing();
              }}
            >
              <Text style={profileStyles.countText}>
                following: {user.following_count ?? ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
                setModalTitle("Followers");
                isRefetchingFollowers();
              }}
            >
              <Text style={profileStyles.countText}>
                followers: {user.followers_count ?? ""}
              </Text>
            </TouchableOpacity>
          </View>
          {usersProfile ? (
            <>
              {!isEditingProfile ? (
                <Pressable
                  style={profileStyles.followButton}
                  onPress={handleEditProfile}
                >
                  <Text style={profileStyles.followButtonText}>
                    edit profile
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={profileStyles.cancelButton}
                  onPress={handleCancelEditProfile}
                >
                  <Text style={profileStyles.cancelButtonText}>cancel</Text>
                </Pressable>
              )}
            </>
          ) : (
            <View style={profileStyles.followButtonContainer}>
              {user.followed_by_user ? (
                <Pressable
                  style={profileStyles.unfollowButton}
                  onPress={handleUnfollowUser}
                >
                  <Text style={profileStyles.unfollowButtonText}>
                    following
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={profileStyles.followButton}
                  onPress={handleFollowUser}
                >
                  <Text style={profileStyles.followButtonText}>follow</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}
      <View style={profileStyles.tweetsContainer}>
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
          ListEmptyComponent={() => EmptyListView("no posts yet.")}
          contentContainerStyle={{ flexGrow: 1 }}
          scrollEnabled={false}
        />
      </View>
      <ProfilesListModal
        isVisible={modalVisible}
        profiles={modalTitle === "Followers" ? followers : following}
        onClose={() => {
          setModalVisible(false);
        }}
        modalTitle={modalTitle}
        handleLoadMoreProfiles={handleMoreProfiles}
        isFetchingNextProfilesPage={
          modalTitle === "Followers"
            ? isFetchingNextFollowersPage
            : isFetchingNextFollowingPage
        }
        userIDOfProfile={user.id}
      />
    </ScrollView>
  );
};

export default Profile;
