import { Alert } from "react-native";
import { useEffect } from "react";
import { useGlobalSearchParams, useNavigation } from "expo-router";
import ModalScreen from "../modal";
import { useUser, User } from "../../context/UserContext";
import { useTweetsApi } from "../../lib/api/tweets";
import { useQuery } from "@tanstack/react-query";

const ProfileScreen = () => {
  const { userID, image, username } = useGlobalSearchParams();
  const navigation = useNavigation();
  const { getUserProfile } = useTweetsApi();
  const { user } = useUser();

  // Set header title
  useEffect(() => {
    let headerTitle = `@${username}`;

    if (user?.id === Number(userID)) {
      headerTitle = "You";
    }

    navigation.setOptions({
      title: headerTitle,
    });
  }, [navigation, userID]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["profiles", userID],
    queryFn: () => getUserProfile(userID as string),
  });

  if (error) {
    console.log(error);
    Alert.alert("We had an issue getting this profile.");
    return null;
  }

  const currentUser: User = {
    id: Number(userID),
    username: String(username),
    image: String(image),
  };

  return <ModalScreen user={data ?? currentUser} />;
};

export default ProfileScreen;
