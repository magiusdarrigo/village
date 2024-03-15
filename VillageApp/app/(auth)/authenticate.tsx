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
import React, { useEffect, useRef, useState } from "react";
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
  const otpCodeRef = useRef<TextInput>(null);

  const isButtonDisabled = code.length < 6;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if the input is currently mounted before calling focus
      otpCodeRef.current?.focus();
    }, 1000); // 1000 milliseconds delay

    return () => clearTimeout(timer); // Clear timeout if component unmounts
  }, []);

  // if the user context does not have a neighborhood and building return true
  const continueOnboarding = () => !user?.neighborhood_id || !user.building_id;

  const onConfirm = async () => {
    if (typeof phoneNumber !== "string") {
      return;
    }
    try {
      Keyboard.dismiss();
      const res = await authenticate({ phoneNumber, phoneToken: code });
      updateAuthToken(res.token);
      if (continueOnboarding()) {
        router.replace("/createProfile");
      }
    } catch (e) {
      Alert.alert("Your OTP code doesn't match. Try again.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text style={onboardingStyles.label}>
          Paste the code we texted you.
        </Text>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <TextInput
            ref={otpCodeRef}
            placeholder=""
            value={code}
            onChangeText={setCode}
            style={styles.input}
            keyboardType="phone-pad"
            autoFocus={false}
            multiline={true}
            numberOfLines={1}
          />
          <Pressable
            style={[
              onboardingStyles.button,
              isButtonDisabled ? onboardingStyles.buttonDisabled : {},
            ]}
            onPress={onConfirm}
            disabled={isButtonDisabled}
          >
            <Text style={onboardingStyles.buttonText}>Confirm</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
    flex: 1,
  },
});

export default Authenticate;
