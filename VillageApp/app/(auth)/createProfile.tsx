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
import {
  handleChooseCustomImage,
  getDeviceType,
  DeviceType,
} from "../../lib/helpers";
import { useRouter } from "expo-router";
import { useUser } from "../../context/UserContext";
import { useTweetsApi } from "../../context/TweetContext";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";
import * as Sentry from "sentry-expo";
import { MaterialCommunityIcon } from "../../components/Icons";
import { defaultImages } from "../../lib/api/onboarding";
import Hyperlink from "react-native-hyperlink";
import { handlePressButtonAsync } from "../../lib/helpers";

const deviceType = getDeviceType();
const smallDevice = deviceType === DeviceType.iPhoneSmall;

const CreateProfile = () => {
  const { updateUser } = useUser();
  const router = useRouter();
  const { updateUserAttributes, checkIfUserAccountWasDeleted } = useTweetsApi();
  const [username, setUsername] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Function to render color options
  const renderColorOptions = () => {
    let images = [...defaultImages]; // Create a copy using spread syntax
    // remove the last 2 colors for small devices
    if (smallDevice) {
      images.pop();
      images.pop();
    }
    return images.map((colorImage) => (
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
      const building = await checkIfUserAccountWasDeleted();
      const updatedUser = await updateUserAttributes({
        username,
        profileImage: image,
        buildingID: building?.id,
        neighborhoodID: building?.neighborhood_id,
      });

      updateUser(updatedUser);
      if (building) {
        // show popup stating this account was previously deleted
        Alert.alert(
          "This phone number was previously used. Welcome back! Please submit a building change request if you've moved."
        );
        router.replace({
          pathname: "/showNeighborhood",
          params: {
            neighborhoodName: building?.neighborhood?.name,
            buildingID: building.id,
            neighborhoodID: building.neighborhood_id,
          },
        });
        return;
      }
      router.replace("/pickBuilding");
    } catch (error: any) {
      const err = JSON.parse(error.message);
      if (err?.status === 400) {
        Alert.alert(err?.body?.error);
        return;
      }
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue uploading your profile. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isButtonDisabled = !username || !image || isSaving;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text
          style={[onboardingStyles.label, smallDevice ? { marginTop: 12 } : {}]}
        >
          Create your anonymous profile.
        </Text>
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
          }}
        >
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
              placeholderTextColor={"grey"}
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
                    onboardingStyles.cameraIconContainer,
                    image ? { opacity: 0.15 } : { opacity: 0.35 },
                  ]}
                  onPress={() => handleChooseCustomImage(setImage)}
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
          <View>
            <Hyperlink
              linkStyle={{ color: "#2980b9" }}
              linkText={(url) => {
                if (
                  url ===
                  "https://villagenyc.notion.site/Privacy-Policy-for-Village-845fb113171045c3bdd26c828e8ccf26"
                ) {
                  return "Privacy Policy";
                } else if (
                  url ===
                  "https://villagenyc.notion.site/Terms-of-Service-for-Village-1da7d1897d1e485e8f80125a3a3be087"
                ) {
                  return "Terms of Service";
                } else if (
                  url ===
                  "https://villagenyc.notion.site/End-User-License-Agreement-for-Village-2c9b62dc0bbc40c48e8eaf0194f9c30c"
                ) {
                  return "End User License Agreement";
                } else {
                  return url;
                }
              }}
              onPress={handlePressButtonAsync}
            >
              <Text style={styles.optInText}>
                By selecting Create, you agree to Village's
                https://villagenyc.notion.site/Privacy-Policy-for-Village-845fb113171045c3bdd26c828e8ccf26,
                https://villagenyc.notion.site/Terms-of-Service-for-Village-1da7d1897d1e485e8f80125a3a3be087,
                and
                https://villagenyc.notion.site/End-User-License-Agreement-for-Village-2c9b62dc0bbc40c48e8eaf0194f9c30c.
              </Text>
            </Hyperlink>
            <Pressable
              style={[
                onboardingStyles.button,
                isButtonDisabled ? onboardingStyles.buttonDisabled : {},
                smallDevice ? { marginBottom: 18 } : {},
              ]}
              onPress={onSave}
              disabled={isButtonDisabled}
            >
              <Text style={onboardingStyles.buttonText}>Create</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
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
  optInText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
});

export default CreateProfile;
