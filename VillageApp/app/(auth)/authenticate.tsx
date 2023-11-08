import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { authenticate } from "../../lib/api/auth";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import Colors from "../../constants/Colors";

const Authenticate = () => {
  const [code, setCode] = useState("");
  const { phoneNumber } = useGlobalSearchParams();
  const router = useRouter();
  const { updateAuthToken } = useAuth();
  const { user } = useUser();

  // if the user context does not have a neighborhood and building return true
  const continueOnboarding = () => !user?.neighborhood_id || !user.building_id;

  const onConfirm = async () => {
    if (typeof phoneNumber !== "string") {
      return;
    }
    try {
      const res = await authenticate({ phoneNumber, phoneToken: code });
      console.log(res);
      updateAuthToken(res.token);
      if (continueOnboarding()) {
        router.push("/createProfile");
      } else {
        router.replace("/");
      }
    } catch (e) {
      Alert.alert("Your OTP code doesn't match. Try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.label}>Paste the code we texted you.</Text>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <TextInput
          placeholder=""
          value={code}
          onChangeText={setCode}
          style={styles.input}
          keyboardType="phone-pad"
          autoFocus={true}
        />
        <Pressable style={styles.button} onPress={onConfirm}>
          <Text style={styles.buttonText}>Confirm</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  error: {
    marginVertical: 5,
    color: "red",
  },
  container: {
    backgroundColor: Colors.light.tertiary,
    flex: 1,
    paddingTop: 24, // for top space
    paddingHorizontal: 24,
  },
  label: {
    marginTop: 36, // space above the label
    fontSize: 24,
    marginBottom: 8, // space below the label
    color: "black",
    fontWeight: "bold",
    alignSelf: "flex-start", // align to top-left
  },
  input: {
    borderColor: "transparent", // no border
    borderWidth: 0,
    paddingTop: 10,
    fontSize: 20,
    color: "black",
  },
  button: {
    backgroundColor: "#050A12",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginTop: 5, // space above the button
    marginBottom: 50, // space below the button
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Authenticate;
