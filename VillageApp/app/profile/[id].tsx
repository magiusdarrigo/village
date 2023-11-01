import { Text } from "react-native";
import Tweet from "../../components/Tweet";
import tweets from "../../assets/data/tweets";
import { useGlobalSearchParams } from "expo-router";

const ProfileScreen = () => {
  const { id } = useGlobalSearchParams();

  const tweet = tweets.find((t) => t.id === id);

  if (!tweet) {
    return <Text>Post not found</Text>;
  }

  return <Tweet tweet={tweet} />;
};

export default ProfileScreen;
