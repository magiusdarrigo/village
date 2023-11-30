import { Alert } from "react-native";
import { useEffect } from "react";
import { useGlobalSearchParams, useNavigation } from "expo-router";
import ModalScreen from "../modal";
import { useUser } from "../../context/UserContext";
import { useTweetsApi } from "../../context/TweetContext";
import { useQuery } from "@tanstack/react-query";

const ProfileScreen = () => {
  const { userID, image, username } = useGlobalSearchParams();
  const navigation = useNavigation();
  const { getUserProfile } = useTweetsApi();
  const { user } = useUser();

  // Set header title
  useEffect(() => {
    let headerTitle = `@${username}`;
    // if userID is undefined then we are viewing our own profile
    if (userID === undefined) {
      headerTitle = "You";
    }

    navigation.setOptions({
      title: headerTitle,
    });
  }, [navigation, userID]);

  // get user profile
  const { data, isLoading, error } = useQuery({
    queryKey: ["profiles", userID],
    queryFn: () => {
      if (userID === undefined) return null;
      return getUserProfile(userID as string);
    },
  });

  if (error) {
    console.log(error);
    Alert.alert("We had an issue getting this profile.");
    return null;
  }

  return <ModalScreen user={data ?? user} />;
};

export default ProfileScreen;
