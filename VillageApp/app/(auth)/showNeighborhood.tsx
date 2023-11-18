import React from "react";
import { Text, View, StyleSheet, Pressable, Alert } from "react-native";
import { useGlobalSearchParams } from "expo-router";
import { useUser } from "../../context/UserContext";
import { useTweetsApi } from "../../context/TweetContext";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";

const ShowNeighborhood = () => {
  const { neighborhoodName, buildingID, neighborhoodID } =
    useGlobalSearchParams();
  const { updateUserAttributes } = useTweetsApi();
  const { user, updateUser } = useUser();

  const neighborhoods = [
    "Chelsea",
    "Chinatown",
    "East Village",
    "Fidi",
    "Flatiron",
    "Gramercy",
    "Greenwich Village",
    "Harlem",
    "Hell's Kitchen",
    "Hudson Yards",
    "Little Italy",
    "Lower East Side",
    "Midtown",
    "Midtown East",
    "Nolita",
    "SoHo",
    "Tribeca",
    "Upper East Side",
    "Upper West Side",
    "West Village",
    "Williamsburg",
  ];

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
      const updatedUser = await updateUserAttributes({
        neighborhoodID: neighborhoodID,
        buildingID: buildingID,
      });
      updateUser(updatedUser);
    } catch (error) {
      console.log(error);
      Alert.alert("We had an issue adding you to the neighborhood. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <Text style={onboardingStyles.label}>
          Welcome to {neighborhoodName} on Village.
        </Text>
        <Pressable style={onboardingStyles.button} onPress={onEnter}>
          <Text style={onboardingStyles.buttonText}>Enter</Text>
        </Pressable>
      </View>
    </View>
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

export default ShowNeighborhood;
