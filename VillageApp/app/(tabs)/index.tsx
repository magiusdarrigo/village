import { StyleSheet, View, FlatList, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { Entypo } from "@expo/vector-icons";
import Tweet from "../../components/Tweet";
import { Link } from "expo-router";

export default function FeedScreen() {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    const fetchTweets = async () => {
      const url = "http://localhost:3000/v1/neighborhoods/1/posts";
      const authToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXNlciIsInBob25lIjoiKzE5NzI1MjI4MTY0IiwiaWQiOjF9.igkJqwNeIGyjNvQyC6_6wA7r5zh2ciFUzeMO-0qLRvI";
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.status !== 200) {
        console.log("Error fetching tweets");
        return;
      }

      const data = await res.json();

      console.log(data);
      // setTweets(data);
    };
    fetchTweets();
  }, []);
  return (
    <View style={styles.page}>
      <FlatList
        data={tweets}
        renderItem={({ item }) => <Tweet tweet={item} />}
      />

      <Link href="/new-tweet" asChild>
        <Pressable style={styles.floatingButton}>
          <Entypo name="plus" size={24} color="white" />
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
    backgroundColor: "black",
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
