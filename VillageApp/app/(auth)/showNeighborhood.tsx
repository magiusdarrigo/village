import React, { useState } from "react";
import { Text, View, StyleSheet, Pressable, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useUser } from "../../context/UserContext";
import { useTweetsApi } from "../../context/TweetContext";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";
import * as Sentry from "sentry-expo";
import { getDeviceType, DeviceType } from "../../lib/helpers";

const deviceType = getDeviceType();
const smallDevice = deviceType === DeviceType.iPhoneSmall;

const ShowNeighborhood = () => {
  const { neighborhoodName, buildingID, neighborhoodID } =
    useLocalSearchParams();
  const { updateUserAttributes } = useTweetsApi();
  const { user, updateUser, updateActiveNeighborhood } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const onEnter = async () => {
    try {
      if (user === null) {
        throw new Error("User is null");
      }
      // validate that neighborhoodID and buildingID are strings
      if (typeof neighborhoodID !== "string") {
        throw new Error("Neighborhood ID is not a string");
      }
      if (typeof buildingID !== "string") {
        throw new Error("Building ID is not a string");
      }
      setIsLoading(true);
      const updatedUser = await updateUserAttributes({
        neighborhoodID: neighborhoodID,
        buildingID: buildingID,
      });
      updateUser(updatedUser);
      updateActiveNeighborhood({
        name: updatedUser.neighborhood.name,
        id: updatedUser.neighborhood_id,
      });
      router.replace("/(auth)/notifications");
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue adding you to the neighborhood. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <Text
          style={[styles.welcomeLabel, smallDevice ? { marginTop: 12 } : {}]}
        >
          Welcome to {neighborhoodName} on Village.
        </Text>
        <Pressable
          style={[
            onboardingStyles.button,
            isLoading ? onboardingStyles.buttonDisabled : {},
            smallDevice ? { marginBottom: 18 } : {},
          ]}
          onPress={onEnter}
          disabled={isLoading}
        >
          <Text style={onboardingStyles.buttonText}>Enter</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeLabel: {
    marginTop: 36, // space above the label
    fontSize: 60,
    marginBottom: 8, // space below the label
    color: "black",
    fontWeight: "bold",
    alignSelf: "flex-start", // align to top-left
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

export default ShowNeighborhood;
