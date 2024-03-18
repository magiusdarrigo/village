import { ActivityIndicator, Alert, Pressable } from "react-native";
import { useEffect } from "react";
import { useGlobalSearchParams, useNavigation } from "expo-router";
import ModalScreen from "../modal";
import { useTweetsApi } from "../../context/TweetContext";
import { useQuery } from "@tanstack/react-query";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Entypo } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import * as Sentry from "sentry-expo";
import { useUser } from "../../context/UserContext";

const ProfileScreen = () => {
  const { user: currentUser, updateUser } = useUser();
  const { userIDParam, username } = useGlobalSearchParams();
  const userID = String(userIDParam);
  const navigation = useNavigation();
  const { getUserProfile, blockUser, unFollowUser } = useTweetsApi();
  const { showActionSheetWithOptions } = useActionSheet();

  const onOtherUserSettingsPress = () => {
    const options = ["Block", "Cancel"];
    const blockUserIndex = 0;
    const cancelButtonIndex = 1;
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: blockUserIndex,
      },
      (selectedIndex: any) => {
        switch (selectedIndex) {
          case blockUserIndex:
            Alert.alert(
              "Are you sure you want block this user?",
              "This action cannot be undone.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Block User",
                  onPress: async () => {
                    try {
                      await unFollowUser(userID);
                      await blockUser(userID);

                      if (currentUser) {
                        updateUser({
                          ...currentUser,
                          blocked_users: [...currentUser.blocked_users, userID],
                        });
                      }

                      navigation.goBack();
                    } catch (error) {
                      Sentry.Native.captureException(error);
                      Alert.alert(
                        "Error",
                        "There was an error blocking the user. Please try again."
                      );
                    }
                  },
                },
              ]
            );
            break;
        }
      }
    );
  };

  // Set header title
  useEffect(() => {
    if (username) {
      if (username === currentUser?.username) {
        navigation.setOptions({
          title: "You",
        });
        return;
      }
      let headerTitle = `@${username}`;
      navigation.setOptions({
        title: headerTitle,
        headerRight: () => (
          <Pressable onPress={onOtherUserSettingsPress}>
            {({ pressed }) => (
              <Entypo
                name="dots-three-horizontal"
                size={25}
                color={Colors.light.text}
                style={{
                  marginRight: 15,
                  opacity: pressed ? 0.5 : 1,
                }}
              />
            )}
          </Pressable>
        ),
      });
    }
  }, [username, navigation]);

  // Get user profile
  const { data, isLoading, error } = useQuery({
    queryKey: ["profiles", userID],
    queryFn: () => (userID ? getUserProfile(String(userID)) : null),
    enabled: !!userID, // This will prevent the query from running if userID is undefined
  });

  // Handle loading and error states
  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    Alert.alert("We had an issue getting this profile.");
    return null;
  }

  // Handle case when userID is undefined or data is not available
  if (!userID || !data) {
    return null; // Or render some fallback UI
  }

  return <ModalScreen user={data} />;
};

export default ProfileScreen;
