import {
  View,
  StyleSheet,
  Text,
  Image,
  TextInput,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTweetsApi } from "../lib/api/tweets";

const user = {
  id: "u1",
  username: "VadimNotJustDev",
  name: "Vadim",
  image: "https://picsum.photos/150",
};

const NewTweet = () => {
  const [text, setText] = useState("");
  const router = useRouter();
  const { createTweet } = useTweetsApi()!;

  const queryClient = useQueryClient();

  const { isLoading, isError, mutateAsync } = useMutation({
    mutationFn: createTweet,
    onSuccess: (data) => {
      queryClient.setQueryData(["tweets"], (old: any) => {
        return [data, ...old];
      });
    },
  });

  const onTweetPress = async () => {
    try {
      await mutateAsync({
        neighborhoodID: 1,
        textContent: text,
        imageURL: "https://picsum.photos/400/800",
      });
      setText("");
      router.back();
    } catch (e: any) {
      console.log("Error creating tweet", e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Link href="../" style={{ fontSize: 16 }}>
            Cancel
          </Link>
          {isLoading && <ActivityIndicator />}
          <Pressable onPress={onTweetPress} style={styles.button}>
            <Text style={styles.buttonText}>Post</Text>
          </Pressable>
        </View>
        <View style={styles.inputContainer}>
          <Image source={{ uri: user.image }} style={styles.image} />
          <TextInput
            value={text}
            onChangeText={(value) => setText(value)}
            placeholder="What's going on in East Village?"
            multiline
            numberOfLines={5}
            style={{ flex: 1 }}
          />
        </View>
        {isError && (
          <Text style={{ color: "red" }}>Failed posting. Try again!</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
  },
  image: {
    width: 50,
    aspectRatio: 1,
    borderRadius: 50,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    backgroundColor: "black",
    borderRadius: 50,
    padding: 5,
    paddingHorizontal: 15,
  },
  buttonText: {
    fontWeight: "600",
    color: "white",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
  },
});

export default NewTweet;
