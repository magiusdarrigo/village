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
import { useRouter } from "expo-router";
import { login } from "../../lib/api/auth";
import { useUser } from "../../context/UserContext";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";

const formatPhoneNumber = (input: string, currentPhoneNumber: string) => {
  // Remove all non-digit characters from the phone number
  let cleaned = input.replace(/\D/g, "");

  // Start with the cleaned input if it's shorter than the current number, likely a delete action
  if (input.length < currentPhoneNumber.length) {
    return cleaned;
  }

  // Begin with the formatted number as the cleaned input
  let formattedNumber = cleaned;

  // Only if we have enough digits, start to format
  if (cleaned.length >= 6) {
    // We have enough for the first two groups
    formattedNumber = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}`;
    // If we have more than 6 digits, add the last part
    if (cleaned.length > 6) {
      formattedNumber += `-${cleaned.slice(6, 10)}`;
    }
  } else if (cleaned.length >= 3) {
    // Only enough for the area code part
    formattedNumber = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  }

  // If not enough for any formatting, just return the cleaned input
  return formattedNumber;
};

const SignIn = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  const { updateUser } = useUser();

  const onSignIn = async () => {
    try {
      const user = await login({ phoneNumber });
      updateUser(user);
      router.replace({ pathname: "/authenticate", params: { phoneNumber } });
    } catch (e) {
      Alert.alert("We had an issue signing you in. Try again.");
    }
  };

  const handlePhoneChange = (input: string) => {
    const formattedInput = formatPhoneNumber(input, phoneNumber);
    setPhoneNumber(formattedInput); // Assuming setPhoneNumber is your state setter
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={onboardingStyles.label}>Enter your phone number.</Text>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <TextInput
          placeholder=""
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          style={styles.input}
          keyboardType="phone-pad"
          autoFocus={true}
        />
        <Pressable style={onboardingStyles.button} onPress={onSignIn}>
          <Text style={onboardingStyles.buttonText}>Get Code</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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

export default SignIn;
