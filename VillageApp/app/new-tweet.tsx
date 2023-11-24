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
  TouchableOpacity,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Link, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTweetsApi } from "../context/TweetContext";
import { useUser } from "../context/UserContext";
import * as Sentry from "sentry-expo";
import { IoniconsIcon } from "../components/Icons";

const NewTweet = () => {
  const [text, setText] = useState("");
  const router = useRouter();
  const { createTweet } = useTweetsApi();
  const { user, scrollToTop } = useUser();
  const queryClient = useQueryClient();
  const tweetTextRef = useRef<TextInput>(null);
  const [image, setImage] = useState<string | undefined>(undefined);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const isPostButtonDisabled = !image && text.length < 1;
  const keyboardVerticalOffset = Platform.OS === "ios" ? 64 : 0;

  useEffect(() => {
    if (!image) {
      return;
    }
    Image.getSize(
      image,
      (width, height) => {
        // Calculate aspect ratio
        const aspectRatio = width / height;
        // Set width and height based on aspect ratio
        const scaledHeight = 150 / aspectRatio;
        setImageSize({ width: 150, height: scaledHeight });
      },
      (error) => {
        console.error(`Couldn't get the image size: ${error.message}`);
      }
    );
  }, [image]);

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
      const characterCount = text.length;
      if (!image && characterCount === 0) {
        Alert.alert("Your post is empty.");
        return;
      }
      if (characterCount > 250) {
        Alert.alert(`Your post is too long.`);
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
        imageURL: image,
      });
      setText("");
      router.back();
      scrollToTop();
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue making your post.");
    }
  };

  const handleUploadImageIconClicked = async () => {
    try {
      // Ask for permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission to access camera roll is required. Try again.");
        return;
      }

      // Pick image
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        aspect: [4, 3],
        quality: 1,
      });
      if (pickerResult.canceled === true) {
        return;
      }
      if (pickerResult.assets.length === 0) {
        return;
      }
      setImage(pickerResult.assets[0].uri);
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue uploading your image. Try again.");
    }
  };

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
            style={{
              marginTop: 8,
              lineHeight: 24,
              fontSize: 20,
              fontWeight: "500",
              textAlignVertical: "top",
              backgroundColor: "white",
              flex: 1,
            }}
          />
        </View>
        <View style={styles.imageContainer}>
          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: image }}
                style={[
                  { width: imageSize.width, height: imageSize.height },
                  styles.libraryImage,
                ]}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImage(undefined)}
              >
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          )}
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
  imagePreviewContainer: {
    position: "relative",
    alignSelf: "flex-start",
  },
  removeImageButton: {
    opacity: 0.7,
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "black",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 2,
    paddingLeft: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  removeImageText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
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
  libraryImage: {
    borderRadius: 8,
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
    backgroundColor: "white",
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
