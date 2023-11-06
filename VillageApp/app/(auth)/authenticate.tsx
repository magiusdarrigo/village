import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { authenticate } from "../../lib/api/auth";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";

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
      Alert.alert("Your phone number code doesn't match. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Confirm your phone number</Text>

      <TextInput
        placeholder="OTP code"
        value={code}
        onChangeText={setCode}
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={onConfirm}>
        <Text style={styles.buttonText}>Confirm</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  label: {
    fontSize: 24,
    marginVertical: 5,
    color: "gray",
  },
  error: {
    marginVertical: 5,
    color: "red",
  },
  input: {
    borderColor: "gray",
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    fontSize: 20,
    marginVertical: 5,
    borderRadius: 10,
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

export default Authenticate;
