import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTweetsApi } from "../context/TweetContext";

// createMutateFollowUser can be destructured to:  { mutate: mutateFollowUser, isLoading: isLoadingFollow }
export const useFollowUser = () => {
  const { followUser } = useTweetsApi();
  const queryClient = useQueryClient();

  return useMutation(
    ({
      userIDToFollow,
      userIDOfProfile,
    }: {
      userIDToFollow: string;
      userIDOfProfile: string | undefined;
    }) => followUser(userIDToFollow),
    {
      onSuccess: (_, variables) => {
        // Update the profiles cache
        queryClient.setQueryData(
          ["profiles", variables.userIDToFollow],
          (oldData: any) => {
            return {
              ...oldData,
              followed_by_user: true,
            };
          }
        );

        // Update the profile following cache
        queryClient.setQueryData(
          ["profilefollowers", variables.userIDOfProfile],
          (oldData: any) => {
            if (!oldData) {
              return;
            }

            const updatedPages = oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((user: any) => {
                if (user.follower_user_id === variables.userIDToFollow) {
                  return { ...user, followed_by_user: true };
                }
                return user;
              }),
            }));

            return {
              ...oldData,
              pages: updatedPages,
            };
          }
        );
        // Update the profile's following cache
        queryClient.setQueryData(
          ["profilefollowing", variables.userIDOfProfile],
          (oldData: any) => {
            if (!oldData) {
              return;
            }

            const updatedPages = oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((user: any) => {
                if (user.following_user_id === variables.userIDToFollow) {
                  return { ...user, followed_by_user: true };
                }
                return user;
              }),
            }));

            return {
              ...oldData,
              pages: updatedPages,
            };
          }
        );
        queryClient.setQueriesData(["contacts"], (oldData: any) => {
          if (!oldData) {
            return;
          }
          const updatedContacts = oldData.data.map((contact: any) => {
            if (contact.id === variables.userIDToFollow) {
              return { ...contact, followed_by_user: true };
            }
            return contact;
          });
          return { data: updatedContacts };
        });
      },
      onError: (error) => {
        console.log(error);
        Alert.alert("We had an issue following this user. Try again.");
      },
    }
  );
};

// createMutateUnfollowUser can be destructured to:  { mutate: mutateUnfollowUser, isLoading: isLoadingUnfollow }
export const useUnfollowUser = () => {
  const { unFollowUser } = useTweetsApi();
  const queryClient = useQueryClient();

  return useMutation(
    ({
      userIDToUnfollow,
      userIDOfProfile,
    }: {
      userIDToUnfollow: string;
      userIDOfProfile: string | undefined;
    }) => unFollowUser(userIDToUnfollow),
    {
      onSuccess: (_, variables) => {
        // Update the profiles cache
        queryClient.setQueryData(
          ["profiles", variables.userIDToUnfollow],
          (oldData: any) => {
            return {
              ...oldData,
              followed_by_user: false,
            };
          }
        );

        // Update the profile followers cache
        queryClient.setQueryData(
          ["profilefollowers", variables.userIDOfProfile],
          (oldData: any) => {
            if (!oldData) {
              return;
            }

            const updatedPages = oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((user: any) => {
                if (user.follower_user_id === variables.userIDToUnfollow) {
                  return { ...user, followed_by_user: false };
                }
                return user;
              }),
            }));

            return {
              ...oldData,
              pages: updatedPages,
            };
          }
        );
        queryClient.setQueryData(
          ["profilefollowing", variables.userIDOfProfile],
          (oldData: any) => {
            if (!oldData) {
              return;
            }

            const updatedPages = oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((user: any) => {
                if (user.following_user_id === variables.userIDToUnfollow) {
                  return { ...user, followed_by_user: false };
                }
                return user;
              }),
            }));

            return {
              ...oldData,
              pages: updatedPages,
            };
          }
        );
        queryClient.setQueriesData(["contacts"], (oldData: any) => {
          if (!oldData) {
            return;
          }
          const updatedContacts = oldData.data.map((contact: any) => {
            if (contact.id === variables.userIDToUnfollow) {
              return { ...contact, followed_by_user: false };
            }
            return contact;
          });
          return { data: updatedContacts };
        });
      },
      onError: (error) => {
        console.log(error);
        Alert.alert("We had an issue unfollowing this user. Try again.");
      },
    }
  );
};
