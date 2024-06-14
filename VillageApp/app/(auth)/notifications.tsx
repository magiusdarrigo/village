import {
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React from "react";
import messaging from "@react-native-firebase/messaging";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";
import { getDeviceType, DeviceType } from "../../lib/helpers";
import * as Sentry from "sentry-expo";
import { router } from "expo-router";

const deviceType = getDeviceType();
const smallDevice = deviceType === DeviceType.iPhoneSmall;

const Notifications = () => {
  const onAllow = async () => {
    try {
      await messaging().requestPermission();
      router.replace("/(auth)/contacts");
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue enabling notifications. Please try again.");
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text
        style={[onboardingStyles.label, smallDevice ? { marginTop: 12 } : {}]}
      >
        Get notified when someone in your apartment sends you a message.
      </Text>
      <Pressable
        style={[
          onboardingStyles.button,
          smallDevice ? { marginBottom: 18 } : {},
        ]}
        onPress={onAllow}
      >
        <Text style={onboardingStyles.buttonText}>Allow Notifications</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.tertiary,
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 24, // for top space
    paddingHorizontal: 24,
  },
});

export default Notifications;
