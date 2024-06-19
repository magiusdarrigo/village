import { Text, Pressable, StyleSheet, View, Alert } from "react-native";
import React from "react";
import onboardingStyles from "../../lib/styles/onboarding";
import { getDeviceType, DeviceType } from "../../lib/helpers";
import * as Sentry from "sentry-expo";
import { Linking } from "react-native";

const deviceType = getDeviceType();
const smallDevice = deviceType === DeviceType.iPhoneSmall;

const wheresEveryone = () => {
  const onEmail = async () => {
    try {
      Linking.openURL(
        "mailto:matteo@juiceapps.llc?subject=Not%20Enough%20Neighbors&body=I'd%20like%20to%20have%20more%20neighbors%20on%20Village.%20My%20building%20address%20is%3A%0A%0A%3CEnter%20building%20address%3E"
      );
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue enabling notifications. Please try again.");
    }
  };
  return (
    <View style={styles.container}>
      <Text style={[onboardingStyles.label, { marginTop: 12 }]}>
        not enough neighbors? shoot us an email and we'll swing by and post
        flyers.
      </Text>
      <Pressable
        style={[
          onboardingStyles.button,
          smallDevice ? { marginBottom: 18 } : {},
        ]}
        onPress={onEmail}
      >
        <Text style={onboardingStyles.buttonText}>email us</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
});

export default wheresEveryone;
