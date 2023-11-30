import { ActivityIndicator, Alert } from "react-native";
import { useEffect } from "react";
import { useGlobalSearchParams, useNavigation } from "expo-router";
import ModalScreen from "../modal";
import { useUser } from "../../context/UserContext";
import { useTweetsApi } from "../../context/TweetContext";
import { useQuery } from "@tanstack/react-query";

const ProfileScreen = () => {
  const { userID, username } = useGlobalSearchParams();
  const navigation = useNavigation();
  const { getUserProfile } = useTweetsApi();

  // Set header title
  useEffect(() => {
    let headerTitle = `@${username}`;
    navigation.setOptions({
      title: headerTitle,
    });
  }, [username]);

  // get user profile
  const { data, isLoading, error } = useQuery({
    queryKey: ["profiles", userID],
    queryFn: () => {
      if (!userID) return null;
      return getUserProfile(userID as string);
    },
  });

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    Alert.alert("We had an issue getting this profile.");
    return null;
  }

  if (!data) {
    return null;
  }

  return <ModalScreen user={data} />;
};

export default ProfileScreen;
