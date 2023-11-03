import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { login } from "../../lib/api/auth";
import { useUser } from "../../context/UserContext";

const SignIn = () => {
  const [phoneNumber, setphoneNumber] = useState("");
  const router = useRouter();

  const { updateUser } = useUser();

  const onSignIn = async () => {
    try {
      const user = await login({ phoneNumber });
      updateUser(user);
      router.push({ pathname: "/authenticate", params: { phoneNumber } });
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sign in or create an account</Text>

      <TextInput
        placeholder="+1 (212) 522-7024"
        value={phoneNumber}
        onChangeText={setphoneNumber}
        style={styles.input}
        inputMode="tel"
      />

      <Pressable style={styles.button} onPress={onSignIn}>
        <Text style={styles.buttonText}>Sign in</Text>
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

export default SignIn;
