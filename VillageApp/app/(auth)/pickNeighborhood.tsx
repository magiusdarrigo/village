import React, { useState } from "react";
import { Text, View, StyleSheet, Pressable, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router, useGlobalSearchParams } from "expo-router";
import { useUser } from "../../context/UserContext";
import { useTweetsApi } from "../../lib/api/tweets";

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

  const onContinue = () => {
    try {
      if (user === null) {
        throw new Error("User is null");
      }
      updateUser({
        ...user,
        neighborhood_id: Number(neighborhoodID),
        building_id: Number(buildingID),
      });
      router.replace("/");
    } catch (error) {
      console.log(error);
      Alert.alert("We had an issue adding you to the neighborhood. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      {neighborhoodName ? (
        <View>
          <Text style={styles.welcomeText}>
            Welcome to {neighborhoodName} on Village.
          </Text>
          <Pressable style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <Text style={styles.questionText}>
            What neighborhood is your building in?
          </Text>
          <Picker
            selectedValue={selectedNeighborhood}
            onValueChange={(itemValue: string) =>
              setSelectedNeighborhood(itemValue)
            }
            style={styles.picker}
          >
            {neighborhoods.map((neighborhood) => (
              <Picker.Item
                key={neighborhood}
                label={neighborhood}
                value={neighborhood}
              />
            ))}
          </Picker>
          <Pressable style={styles.button} onPress={onSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  questionText: {
    fontSize: 20,
    fontWeight: "normal",
    marginBottom: 20,
  },
  picker: {
    width: 300,
    height: 44,
  },
  button: {
    backgroundColor: "#050A12",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginVertical: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default PickNeighborhood;
