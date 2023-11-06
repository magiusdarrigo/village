import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useGlobalSearchParams } from "expo-router";

const PickNeighborhood = () => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
  const { neighborhoodName } = useGlobalSearchParams();

  const neighborhoods = [
    "Chelsea",
    "Chinatown",
    "East Village",
    "FiDi",
    "Flatiron",
    "Gramercy",
    "Greenwich",
    "Harlem",
    "Hell's Kitchen",
    "Hudson Yards",
    "Little Italy",
    "LES",
    "Midtown East",
    "Nolita",
    "Roosvelt Island",
    "SoHo",
    "Tribeca",
    "Upper East Side",
    "Upper West Side",
    "West Village",
    "Williamsburg",
  ];

  return (
    <View style={styles.container}>
      {neighborhoodName ? (
        <Text style={styles.welcomeText}>
          Welcome to {neighborhoodName} on Village.
        </Text>
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
});

export default PickNeighborhood;
