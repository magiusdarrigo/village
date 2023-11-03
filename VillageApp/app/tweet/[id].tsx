import { ActivityIndicator, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTweetsApi } from "../../lib/api/tweets";
import Tweet from "../../components/Tweet";
import { useGlobalSearchParams } from "expo-router";

const TweetScreen = () => {
  const { id } = useGlobalSearchParams();
  const { getTweet } = useTweetsApi();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tweet", id],
    queryFn: () => getTweet(id as string),
  });

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Post couldn't be found!</Text>;
  }

  return <Tweet tweet={data} />;
};

export default TweetScreen;
