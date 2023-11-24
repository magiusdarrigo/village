import React, { useState } from "react";
import { Text, View, StyleSheet, Pressable, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router, useGlobalSearchParams } from "expo-router";
import { useUser } from "../../context/UserContext";
import { useTweetsApi } from "../../context/TweetContext";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";
import * as Sentry from "sentry-expo";

const PickNeighborhood = () => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const { buildingAddress } = useGlobalSearchParams();
  const { createBuilding } = useTweetsApi();
  const { user } = useUser();

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
      router.replace({
        pathname: "/showNeighborhood",
        params: {
          neighborhoodName: selectedNeighborhood,
          buildingID: building.id,
          neighborhoodID: building.neighborhood_id,
        },
      });
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue adding you to the neighborhood. Try again.");
    }
  };

  return (
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

export default PickNeighborhood;
