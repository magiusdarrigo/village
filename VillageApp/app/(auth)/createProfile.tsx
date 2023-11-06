import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Button,
  TextInput,
  Pressable,
  Text,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useUser } from "../../context/UserContext";
import { useTweetsApi } from "../../lib/api/tweets";

const CreateProfile = () => {
  const { user, updateUser } = useUser();
  const router = useRouter();
  const { uploadProfileWithDefaultPic, uploadProfileWithCustomPic } =
    useTweetsApi();

  const getRandomProfileImageURL = () => {
    // pick a random number from 0 to 50
    const randomNumber = Math.floor(Math.random() * 50);
    return `https://zgsgsszttvkptdpijrzb.supabase.co/storage/v1/object/public/profile_pictures/defaults/profile${randomNumber}.jpg`;
  };

  const [profileImage, setProfileImage] = useState<
    string | ImagePicker.ImagePickerAsset
  >(user?.image || getRandomProfileImageURL());
  const [username, setUsername] = useState(user?.username || "");

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0]);
    }
  };

  const onSave = async () => {
    try {
      let updatedUser;
      if (typeof profileImage === "string") {
        updatedUser = await uploadProfileWithDefaultPic({
          username,
          profileImage,
        });
      } else {
        // custom image from user
        const formData = new FormData();

        formData.append("photo", {
          username,
          uri:
            Platform.OS === "ios"
              ? profileImage.uri.replace("file://", "")
              : profileImage.uri,
          type: profileImage.type,
          name: profileImage.fileName,
        } as any);
        updatedUser = await uploadProfileWithCustomPic(formData);
      }
      updateUser(updatedUser);
      router.push("/pickBuilding");
    } catch (err) {
      Alert.alert("Failed to upload your profile");
    }
  };

  const imageToShow =
    typeof profileImage === "string" ? profileImage : profileImage.uri;

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageToShow }} style={styles.profileImage} />
      <Button title="Change Profile" onPress={handleChoosePhoto} />
      <TextInput
        style={styles.usernameInput}
        onChangeText={setUsername}
        value={username}
        placeholder="Username"
      />
      <Pressable style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  button: {
    backgroundColor: "#050A12",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginVertical: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default CreateProfile;
