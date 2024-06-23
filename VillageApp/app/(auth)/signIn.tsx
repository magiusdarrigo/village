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
  TouchableOpacity,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, SplashScreen } from "expo-router";
import { login } from "../../lib/api/auth";
import { useUser } from "../../context/UserContext";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";
import * as Sentry from "sentry-expo";
import { stripParentheses, getDeviceType, DeviceType } from "../../lib/helpers";

const deviceType = getDeviceType();
const smallDevice = deviceType === DeviceType.iPhoneSmall;

const SignIn = () => {
  const [show, setShow] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [_, setLastKeyPressed] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { updateUser } = useUser();
  const phoneNumberInputRef = useRef<TextInput>(null);

  const isNumberInvalid = phoneNumber.length < 14;

  const onKeyPress = ({ nativeEvent }: { nativeEvent: any }) => {
    setLastKeyPressed(nativeEvent.key);
  };

  useEffect(() => {
    const splashScreenTimer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);

    const phoneNumberTimer = setTimeout(() => {
      // Check if the input is currently mounted before calling focus
      phoneNumberInputRef.current?.focus();
    }, 1500);

    return () => {
      clearTimeout(phoneNumberTimer);
      clearTimeout(splashScreenTimer);
    };
  }, []);

  const onSignIn = async () => {
    try {
      setIsLoading(true);
      Keyboard.dismiss();
      const user = await login({ phoneNumber });
      updateUser(user);
      router.replace({
        pathname: "/authenticate",
        params: { phoneNumber: stripParentheses(phoneNumber) },
      });
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue signing you in. Try again.");
    } finally {
      setIsLoading(false);
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
        <Text
          style={[onboardingStyles.label, smallDevice ? { marginTop: 12 } : {}]}
        >
          enter your phone number.
        </Text>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              onPress={() => setShow(true)}
              style={{
                maxHeight: 50,
                backgroundColor: Colors.light.tertiary,
                paddingTop: 10,
                paddingRight: 10,
              }}
            >
              <Text
                style={{
                  color: "black",
                  fontSize: 22,
                }}
              >
                {countryCode}
              </Text>
            </TouchableOpacity>
            <CountryPicker
              lang="en"
              show={show}
              pickerButtonOnPress={(item) => {
                setCountryCode(item.dial_code);
                setShow(false);
              }}
              style={{
                modal: {
                  height: 500,
                },
              }}
            />
            <TextInput
              ref={phoneNumberInputRef}
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
          </View>
          <View>
            <Text style={styles.optInText}>
              by selecting get code, you agree to receiving sms verification
              messages from Village.
            </Text>
            <Pressable
              style={[
                onboardingStyles.button,
                isNumberInvalid || isLoading
                  ? onboardingStyles.buttonDisabled
                  : {},
                smallDevice ? { marginBottom: 18 } : {},
              ]}
              onPress={onSignIn}
              disabled={isNumberInvalid || isLoading}
            >
              <Text style={onboardingStyles.buttonText}>get code</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    flexDirection: "row",
  },
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
    fontSize: 22,
    color: "black",
    flex: 1,
  },
});

export default SignIn;
