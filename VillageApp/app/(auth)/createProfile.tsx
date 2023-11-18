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
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useUser } from "../../context/UserContext";
import { useTweetsApi } from "../../context/TweetContext";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";

const CreateProfile = () => {
  const { user, updateUser } = useUser();
  const router = useRouter();
  const { updateUserAttributes, uploadProfileWithCustomPic } = useTweetsApi();

  // const getRandomProfileImageURL = () => {
  //   // pick a random number from 0 to 50
  //   const randomNumber = Math.floor(Math.random() * 50);
  //   return `https://zgsgsszttvkptdpijrzb.supabase.co/storage/v1/object/public/profile_pictures/defaults/profile${randomNumber}.jpg`;
  // };

  // const [profileImage, setProfileImage] = useState<
  //   string | ImagePicker.ImagePickerAsset
  // >(user?.image || getRandomProfileImageURL());
  const [username, setUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState("#0047AB");
  const colors = [
    "#065535",
    "#F8BBD0",
    "#800080",
    "#990000",
    "#20b2aa",
    "#C5CAE9",
    "#BBDEFB",
    "#003366",
    "#333333",
    "#B2DFDB",
    "#ffa500",
    "#bada55",
    "#854442",
    "#96ceb4",
    "#ff4040",
    "#005b96",
    "#00ff7f",
    "#ffcf40",
  ];

  // Function to render color options
  const renderColorOptions = () => {
    return colors.map((color) => (
      <TouchableOpacity
        key={color}
        style={[
          styles.colorOption,
          { backgroundColor: color },
          selectedColor === color && styles.selectedColor,
        ]}
        onPress={() => setSelectedColor(color)}
      />
    ));
  };

  // const handleChoosePhoto = async () => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== "granted") {
  //     alert("Sorry, we need camera roll permissions to make this work!");
  //     return;
  //   }

  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });

  //   if (!result.canceled) {
  //     setProfileImage(result.assets[0]);
  //   }
  // };

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
    }
    return false;
  };

  const onSave = async () => {
    try {
      const hasErr = validateInput();
      if (hasErr) {
        return;
      }
      const updatedUser = await updateUserAttributes({
        username,
        profileImage: selectedColor,
      });
      updateUser(updatedUser);
      router.replace("/pickBuilding");
    } catch (error: any) {
      // convert error to json
      const err = await error.json();
      if (err?.status === 400) {
        Alert.alert(err?.body?.error);
        return;
      }

      Alert.alert("We had an issue uploading your profile. Try again.");
    }
  };

  // const onSave = async () => {
  //   try {
  //     const hasErr = validateInput();
  //     if (hasErr) {
  //       return;
  //     }
  //     let updatedUser;
  //     if (typeof profileImage === "string") {
  //       updatedUser = await updateUserAttributes({
  //         username,
  //         profileImage,
  //       });
  //     } else {
  //       // custom image from user
  //       const formData = new FormData();

  //       formData.append("photo", {
  //         username,
  //         uri:
  //           Platform.OS === "ios"
  //             ? profileImage.uri.replace("file://", "")
  //             : profileImage.uri,
  //         type: profileImage.type,
  //         name: profileImage.fileName,
  //       } as any);
  //       updatedUser = await uploadProfileWithCustomPic(formData);
  //     }
  //     updateUser(updatedUser);
  //     router.replace("/pickBuilding");
  //   } catch (err) {
  //     Alert.alert("We had an issue uploading your profile. Try again.");
  //   }
  // };

  // const imageToShow =
  //   typeof profileImage === "string" ? profileImage : profileImage.uri;

  // return (
  //   <View style={styles.container}>
  //     <Image source={{ uri: imageToShow }} style={styles.profileImage} />
  //     <Button title="Change Profile" onPress={handleChoosePhoto} />
  //     <TextInput
  //       style={styles.usernameInput}
  //       onChangeText={setUsername}
  //       value={username}
  //       placeholder="Username"
  //     />
  //     <Pressable style={styles.button} onPress={onSave}>
  //       <Text style={styles.buttonText}>Save</Text>
  //     </Pressable>
  //   </View>
  // );

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
            />
            <Text style={styles.inputLabel}>Color</Text>
            <View style={styles.colorPickerContainer}>
              {renderColorOptions()}
            </View>
          </View>
          <Pressable style={onboardingStyles.button} onPress={onSave}>
            <Text style={onboardingStyles.buttonText}>Save</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
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
    borderColor: "#000", // Change this color as needed for your design
  },
});

export default CreateProfile;
