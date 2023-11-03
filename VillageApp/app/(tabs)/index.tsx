import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  Text,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import Tweet from "../../components/Tweet";
import { Link } from "expo-router";
import { useTweetsApi } from "../../lib/api/tweets";
import { useQuery } from "@tanstack/react-query";
import colors from "../../constants/Colors";

export default function FeedScreen() {
  const { listTweets } = useTweetsApi();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tweets"],
    queryFn: listTweets,
  });

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Couldn't Load Posts!</Text>;
  }

  return (
    <View style={styles.page}>
      <FlatList data={data} renderItem={({ item }) => <Tweet tweet={item} />} />

      <Link href="/new-tweet" asChild>
        <Pressable style={styles.floatingButton}>
          <Entypo name="plus" size={24} color="black" />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "white",
  },
  floatingButton: {
    backgroundColor: colors.light.tertiary,
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    // shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
});
