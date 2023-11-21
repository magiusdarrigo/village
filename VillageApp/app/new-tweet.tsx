import {
  View,
  StyleSheet,
  Text,
  Image,
  TextInput,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Link, useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTweetsApi } from "../context/TweetContext";
import { useUser } from "../context/UserContext";
import * as Sentry from "sentry-expo";

const NewTweet = () => {
  const [text, setText] = useState("");
  const router = useRouter();
  const { createTweet } = useTweetsApi();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const tweetTextRef = useRef<TextInput>(null);

  const isPostButtonDisabled = text.length < 1;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if the input is currently mounted before calling focus
      tweetTextRef.current?.focus();
    }, 1000); // 1000 milliseconds delay

    return () => clearTimeout(timer); // Clear timeout if component unmounts
  }, []);

  const { isLoading, mutateAsync } = useMutation({
    mutationFn: createTweet,
    onSuccess: (newData) => {
      queryClient.setQueryData(["tweets"], (old: any) => {
        if (!old) {
          // If for some reason we don't have the pages, just return a new page structure
          return {
            pageParams: [],
            pages: [{ data: [newData], nextCursor: null, prevCursor: null }],
          };
        }

        // Otherwise, add the new tweet to the beginning of the first page
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: [newData, ...old.pages[0].data],
            },
            ...old.pages.slice(1),
          ],
        };
      });
    },
    onError: async (error: any) => {
      // convert error to json
      const err = await error.json();
      if (err?.status === 400) {
        Alert.alert(err?.body?.error);
        return;
      }
      console.log(error);
      Alert.alert("We had an issue making your post. Try again.");
    },
  });

  const onTweetPress = async () => {
    try {
      // check character count
      const characterCount = text.length;
      if (characterCount < 1 || characterCount > 400) {
        Alert.alert(
          `Your post is ${characterCount} characters long. It needs to be between 1 and 400 characters.`
        );
        return;
      }
      // check new line count
      const newLineCount = text.split("\n").length;
      if (newLineCount > 19) {
        Alert.alert(
          `Your post has ${newLineCount} lines. It needs to be less than 20 lines.`
        );
        return;
      }
      Keyboard.dismiss();
      if (user?.neighborhood_id === undefined) {
        Alert.alert("We had an issue making your post. Try again.");
        return;
      }

      await mutateAsync({
        neighborhoodID: user?.neighborhood_id,
        textContent: text,
        // imageURL: "https://picsum.photos/400/800",
      });
      setText("");
      router.back();
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue making your post.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={styles.container}>
          <View style={styles.buttonContainer}>
            <Link href="../" style={{ fontSize: 16 }}>
              Cancel
            </Link>
            {isLoading && <ActivityIndicator />}
            <Pressable
              onPress={onTweetPress}
              style={[
                styles.button,
                isPostButtonDisabled ? styles.buttonDisabled : {},
              ]}
              disabled={isPostButtonDisabled}
            >
              <Text style={styles.buttonText}>Post</Text>
            </Pressable>
          </View>
          <View style={styles.inputContainer}>
            <View style={[styles.image, { backgroundColor: user?.image }]} />
            <TextInput
              ref={tweetTextRef}
              autoFocus={false}
              value={text}
              onChangeText={(value) => setText(value)}
              placeholder={`What's going on in ${user?.neighborhood?.name}?`}
              multiline
              numberOfLines={5}
              style={{
                marginTop: 8,
                flex: 1,
                lineHeight: 22,
                fontSize: 18,
                fontWeight: "500",
                textAlignVertical: "top",
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
  buttonDisabled: {
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
  },
});

export default NewTweet;
