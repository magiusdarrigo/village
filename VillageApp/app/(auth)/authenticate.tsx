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
import onboardingStyles from "../../lib/styles/onboarding";

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
      <Text style={onboardingStyles.label}>Paste the code we texted you.</Text>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <TextInput
          placeholder=""
          value={code}
          onChangeText={setCode}
          style={styles.input}
          keyboardType="phone-pad"
          autoFocus={true}
        />
        <Pressable style={onboardingStyles.button} onPress={onConfirm}>
          <Text style={onboardingStyles.buttonText}>Confirm</Text>
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
  input: {
    borderColor: "transparent", // no border
    borderWidth: 0,
    paddingTop: 10,
    fontSize: 20,
    color: "black",
  },
});

export default Authenticate;
