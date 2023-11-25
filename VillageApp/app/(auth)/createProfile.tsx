import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Text,
  Alert,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useUser } from "../../context/UserContext";
import { useTweetsApi } from "../../context/TweetContext";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";
import * as Sentry from "sentry-expo";
import { MaterialCommunityIcon } from "../../components/Icons";
import { defaultImages } from "../../lib/api/onboarding";

const CreateProfile = () => {
  const { updateUser } = useUser();
  const router = useRouter();
  const { updateUserAttributes } = useTweetsApi();
  const [username, setUsername] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Function to render color options
  const renderColorOptions = () => {
    return defaultImages.map((colorImage) => (
      <TouchableOpacity
        key={colorImage}
        onPress={() => setImage(colorImage)}
        style={[styles.colorOption]}
      >
        <Image
          source={{ uri: colorImage }}
          style={[
            {
              width: 50,
              height: 50,
              borderRadius: 25,
            },
            image === colorImage ? styles.selectedColor : {},
          ]}
        />
      </TouchableOpacity>
    ));
  };

  const validateInput = () => {
    if (!username) {
      Alert.alert("Please enter a username.");
      return true;
    } else if (username.length > 16) {
      Alert.alert("Please enter a username no greater than 16 characters.");
      return true;
    } else if (username.includes(" ")) {
      Alert.alert("Please enter a username without spaces.");
      return true;
    } else if (!image) {
      Alert.alert("Please choose a profile picture.");
      return true;
    }
    return false;
  };

  const onSave = async () => {
    try {
      const hasErr = validateInput();
      if (hasErr) {
        return;
      }
      setIsSaving(true);
      const updatedUser = await updateUserAttributes({
        username,
        profileImage: image,
      });
      updateUser(updatedUser);
      router.replace("/pickBuilding");
      setIsSaving(false);
    } catch (error: any) {
      setIsSaving(false);
      // convert error to json
      const err = await error.json();
      if (err?.status === 400) {
        Alert.alert(err?.body?.error);
        return;
      }
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue uploading your profile. Try again.");
    }
  };

  const handleChooseCustomImage = async () => {
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

  const isButtonDisabled = !username || !image || isSaving;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text style={onboardingStyles.label}>
          Create your anonymous profile.
        </Text>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              autoComplete="off"
              autoCorrect={false}
              autoCapitalize="none"
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              placeholderTextColor={"lightgrey"}
            />
            <Text style={styles.inputLabel}>Profile Picture</Text>
            <View style={styles.customProfilePictureParentContainer}>
              <View style={styles.customProfilePictureContainer}>
                <Image
                  source={image}
                  contentFit="cover"
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />
                <TouchableOpacity
                  style={[
                    styles.cameraIconContainer,
                    image ? { opacity: 0.15 } : { opacity: 0.35 },
                  ]}
                  onPress={handleChooseCustomImage}
                >
                  <MaterialCommunityIcon
                    icon="camera-outline"
                    size={40}
                    iconColor="white"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.colorPickerContainer}>
              {renderColorOptions()}
            </View>
          </View>
          <Pressable
            style={[
              onboardingStyles.button,
              isButtonDisabled ? onboardingStyles.buttonDisabled : {},
            ]}
            onPress={onSave}
            disabled={isButtonDisabled}
          >
            <Text style={onboardingStyles.buttonText}>Save</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  cameraIconContainer: {
    position: "absolute",
    backgroundColor: "black",
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    paddingTop: 2,
    paddingLeft: 6,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customProfilePictureContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  customProfilePictureParentContainer: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  usernameInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: "80%",
  },
  container: {
    backgroundColor: Colors.light.tertiary,
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  label: {
    marginTop: 36,
    fontSize: 24,
    marginBottom: 8,
    color: "black",
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  inputLabel: {
    marginTop: 24,
    fontSize: 15,
    marginBottom: 4,
    color: "black",
    alignSelf: "flex-start",
  },
  input: {
    borderColor: "transparent",
    borderWidth: 0,
    paddingTop: 10,
    fontSize: 20,
    color: "black",
  },
  colorPickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 3,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: "#000",
  },
});

export default CreateProfile;
