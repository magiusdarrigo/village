import {
  View,
  StyleSheet,
  Text,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Link, useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTweetsApi } from "../context/TweetContext";
import { useUser } from "../context/UserContext";
import * as Sentry from "sentry-expo";
import { IoniconsIcon } from "../components/Icons";

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
      tweetTextRef.current?.focus();
    }, 750);

    return () => clearTimeout(timer); // Clear timeout if component unmounts
  }, []);

  const { isLoading, mutateAsync } = useMutation({
    mutationFn: createTweet,
    onSuccess: (newData) => {
      queryClient.setQueryData(["tweets"], (old: any) => {
        if (!old) {
          return {
            pageParams: [],
            pages: [{ data: [newData], nextCursor: null, prevCursor: null }],
          };
        }

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
      if (characterCount < 1 || characterCount > 250) {
        Alert.alert(
          `Your post is ${characterCount} characters long. It needs to be between 1 and 250 characters.`
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

  const handleUploadImageIconClicked = () => {
    Alert.alert("Upload image clicked");
  };

  const keyboardVerticalOffset = Platform.OS === "ios" ? 64 : 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
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
              lineHeight: 24,
              fontSize: 20,
              fontWeight: "500",
              textAlignVertical: "top",
            }}
          />
        </View>
        <View style={styles.multiMediaContainer}>
          <Pressable
            style={styles.uploadImageContainer}
            onPress={handleUploadImageIconClicked}
          >
            <IoniconsIcon icon="image-outline" iconColor="black" size={32} />
          </Pressable>
          <View style={styles.charCountContainer}>
            <Text
              style={
                text.length > 250
                  ? styles.charCounterNegative
                  : styles.charCounterPositive
              }
            >
              {250 - text.length}
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  image: {
    width: 50,
    aspectRatio: 1,
    borderRadius: 50,
    marginRight: 10,
  },
  buttonContainer: {
    paddingHorizontal: 10,
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
    paddingHorizontal: 10,
    flexDirection: "row",
    flex: 1,
  },
  multiMediaContainer: {
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    height: 75,
    backgroundColor: "white",
    borderColor: "lightgrey",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  uploadImageContainer: {
    paddingTop: 8,
  },
  charCountContainer: {
    paddingTop: 16,
  },
  charCounterPositive: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
  },
  charCounterNegative: {
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
  },
});

export default NewTweet;
