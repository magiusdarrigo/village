import React, { useState } from "react";
import { Text, View, StyleSheet, Pressable, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router, useGlobalSearchParams } from "expo-router";
import { useUser } from "../../context/UserContext";
import { useTweetsApi } from "../../lib/api/tweets";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";

const PickNeighborhood = () => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const { buildingAddress, neighborhoodName, buildingID, neighborhoodID } =
    useGlobalSearchParams();
  const { createBuilding, updateUserAttributes } = useTweetsApi();
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

  const onSubmit = async () => {
    try {
      // create building and attach to neighborhood
      const building = await createBuilding(
        buildingAddress as string,
        selectedNeighborhood
      );
      // attach neighborhood and building to user
      if (user === null) {
        throw new Error("User is null");
      }
      const updatedUser = await updateUserAttributes({
        neighborhoodID: building.neighborhood_id,
        buildingID: building.id,
      });
      // assign returned user to user context
      updateUser(updatedUser);
      router.replace("/");
    } catch (error) {
      console.log(error);
      Alert.alert("We had an issue adding you to the neighborhood. Try again.");
    }
  };

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
      // TODO: await for user to be added to building chat instance
      router.replace("/");
    } catch (error) {
      console.log(error);
      Alert.alert("We had an issue adding you to the neighborhood. Try again.");
    }
  };

  return (
    <>
      {neighborhoodName ? (
        <View style={styles.container}>
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <Text style={styles.welcomeLabel}>
              Welcome to {neighborhoodName} on Village.
            </Text>
            <Pressable style={onboardingStyles.button} onPress={onEnter}>
              <Text style={onboardingStyles.buttonText}>Enter</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            <Text style={onboardingStyles.label}>
              What neighborhood is your building in?
            </Text>
            <Picker
              selectedValue={selectedNeighborhood}
              onValueChange={(itemValue: string) =>
                setSelectedNeighborhood(itemValue)
              }
            >
              {neighborhoods.map((neighborhood) => (
                <Picker.Item
                  key={neighborhood}
                  label={neighborhood}
                  value={neighborhood}
                />
              ))}
            </Picker>
            <Pressable style={onboardingStyles.button} onPress={onSubmit}>
              <Text style={onboardingStyles.buttonText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.tertiary,
    flex: 1,
    paddingTop: 24, // for top space
    paddingHorizontal: 24,
  },
  welcomeLabel: {
    marginTop: 36, // space above the label
    fontSize: 36,
    marginBottom: 8, // space below the label
    color: "black",
    fontWeight: "bold",
    alignSelf: "flex-start", // align to top-left
  },
  input: {
    borderColor: "transparent", // no border
    borderWidth: 0,
    paddingTop: 10,
    fontSize: 20,
    color: "black",
  },
});

export default PickNeighborhood;
