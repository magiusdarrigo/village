import { ActivityIndicator, Alert, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTweetsApi } from "../../lib/api/tweets";
import Tweet from "../../components/Tweet";
import { useGlobalSearchParams } from "expo-router";

const TweetScreen = () => {
  const { id } = useGlobalSearchParams();
  const { getTweet } = useTweetsApi();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tweets", id],
    queryFn: () => getTweet(id as string),
  });

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return Alert.alert(
      "We had an issue getting this post. It might've been deleted."
    );
  }

  return <Tweet tweet={data} />;
};

export default TweetScreen;
