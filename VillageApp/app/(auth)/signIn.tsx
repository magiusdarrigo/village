import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { login } from "../../lib/api/auth";
import { useUser } from "../../context/UserContext";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";

const SignIn = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [lastKeyPressed, setLastKeyPressed] = useState("");
  const router = useRouter();
  const { updateUser } = useUser();

  const onKeyPress = ({ nativeEvent }: { nativeEvent: any }) => {
    setLastKeyPressed(nativeEvent.key);
  };

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
    // First, remove all non-digit characters
    const digitsOnly = input.replace(/\D/g, "");

    // Then, format the digits
    let formattedInput = "";
    if (digitsOnly.length >= 1) {
      formattedInput += `(${digitsOnly.slice(0, 3)}`;
    }
    if (digitsOnly.length >= 4) {
      formattedInput += `) ${digitsOnly.slice(3, 6)}`;
    }
    if (digitsOnly.length >= 7) {
      formattedInput += `-${digitsOnly.slice(6, 10)}`;
    }

    // Update the state with the newly formatted input
    setPhoneNumber(formattedInput);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
            onKeyPress={onKeyPress}
            style={styles.input}
            keyboardType="phone-pad"
            autoFocus={false}
            multiline={true}
            numberOfLines={1}
          />

          <View>
            <Text style={styles.optInText}>
              By selecting Get Code, you agree to receiving SMS verification
              messages from Village.
            </Text>
            <Pressable style={onboardingStyles.button} onPress={onSignIn}>
              <Text style={onboardingStyles.buttonText}>Get Code</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  optInText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
  container: {
    backgroundColor: Colors.light.tertiary,
    flex: 1,
    paddingTop: 24, // for top space
    paddingHorizontal: 24,
  },
  input: {
    textAlignVertical: "top",
    borderColor: "transparent", // no border
    borderWidth: 0,
    paddingTop: 10,
    fontSize: 20,
    color: "black",
    flex: 1,
  },
});

export default SignIn;
