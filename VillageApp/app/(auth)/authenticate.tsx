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
import { useLocalSearchParams, useRouter } from "expo-router";
import { authenticate } from "../../lib/api/auth";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";
import {
  addParenthesesToPhoneNumber,
  getDeviceType,
  DeviceType,
} from "../../lib/helpers";

const deviceType = getDeviceType();
const smallDevice = deviceType === DeviceType.iPhoneSmall;

const Authenticate = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  let { phoneNumber, countryCode } = useLocalSearchParams();
  // add back parantheses to the phone number. Have to do this because someone on the expo team is brain dead
  // TODO: remove once issue: https://github.com/expo/expo/issues/26664 resolved. Because these regex-based helpers will
  // break in the future if the phone number format changes
  phoneNumber = addParenthesesToPhoneNumber(phoneNumber.toString());
  const router = useRouter();
  const { updateAuthToken } = useAuth();
  const { user, updateActiveNeighborhood } = useUser();
  const otpCodeRef = useRef<TextInput>(null);
  const isCodeInvalid = code.length < 6;

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
    if (typeof phoneNumber !== "string" || typeof countryCode !== "string") {
      return;
    }
    try {
      setIsLoading(true);
      Keyboard.dismiss();
      const res = await authenticate({
        phoneNumber: `${countryCode} ${phoneNumber}`,
        phoneToken: code,
      });
      updateAuthToken(res.token);
      if (continueOnboarding()) {
        router.replace("/createProfile");
      }
      if (user?.neighborhood_id && user?.neighborhood) {
        updateActiveNeighborhood({
          name: user?.neighborhood?.name,
          id: user?.neighborhood_id,
          is_locked: user?.neighborhood?.is_locked,
        });
      }
    } catch (e) {
      Alert.alert("Your OTP code expired or doesn't match. Try again.");
      // send the user back to the sign in page
      router.replace("/signIn");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text
          style={[onboardingStyles.label, smallDevice ? { marginTop: 12 } : {}]}
        >
          paste the code we texted you.
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
              isCodeInvalid || isLoading ? onboardingStyles.buttonDisabled : {},
              smallDevice ? { marginBottom: 18 } : {},
            ]}
            onPress={onConfirm}
            disabled={isCodeInvalid || isLoading}
          >
            <Text style={onboardingStyles.buttonText}>confirm</Text>
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
