import { ActivityIndicator, Alert } from "react-native";
import { useEffect } from "react";
import { useGlobalSearchParams, useNavigation } from "expo-router";
import ModalScreen from "../modal";
import { useTweetsApi } from "../../context/TweetContext";
import { useQuery } from "@tanstack/react-query";

const ProfileScreen = () => {
  const { userID, username } = useGlobalSearchParams();
  const navigation = useNavigation();
  const { getUserProfile } = useTweetsApi();

  console.log("profile screen rendering, userID: ", userID);

  // Set header title
  useEffect(() => {
    if (username) {
      let headerTitle = `@${username}`;
      navigation.setOptions({
        title: headerTitle,
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
