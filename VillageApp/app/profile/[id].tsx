import { Text } from "react-native";
import tweets from "../../assets/data/tweets";
import { useGlobalSearchParams } from "expo-router";
import ModalScreen from "../modal";

const ProfileScreen = () => {
  const { id } = useGlobalSearchParams();

  const tweet = tweets.find((t) => t.user.id === id);
  const user = tweet?.user;

  if (!user) {
    return <Text>Profile not found</Text>;
  }

  return <ModalScreen user={user} />;
};

export default ProfileScreen;
