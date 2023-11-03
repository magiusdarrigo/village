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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "../../context/UserContext";
import { useTweetsApi } from "../../lib/api/tweets";

const CreateProfile = () => {
  const { user, updateUser } = useUser();
  const { uploadProfile } = useTweetsApi();

  const [profileImage, setProfileImage] = useState(
    user?.image || "https://picsum.photos/150"
  );
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
      setProfileImage(result.assets[0].uri);
    }
  };

  const onSave = async () => {
    try {
      const updatedUser = await uploadProfile(username, profileImage);
      updateUser(updatedUser);
    } catch (err) {
      Alert.alert("Failed to upload your profile");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: profileImage }} style={styles.profileImage} />
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
