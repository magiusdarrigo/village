import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Colors from "../../constants/Colors";

type NeighborhoodProps = {
  neighborhood: string;
  isSelected: boolean;
  onPress: () => void;
};

const neighborhoodsData = [
  {
    title: "Manhattan",
    neighborhoods: [
      "Battery Park City",
      "Carnegie Hill",
      "Central Harlem",
      "Chelsea",
      "Chinatown",
      "East Harlem",
      "East Village",
      "Fidi",
      "Flatiron",
      "Gramercy",
      "Greenwich Village",
      "Hell's Kitchen",
      "Hudson Yards",
      "Kips Bay",
      "Lenox Hill",
      "Little Italy",
      "Lower East Side",
      "Manhattanville",
      "Meatpacking District",
      "Midtown",
      "Murray Hill",
      "NoHo",
      "Nolita",
      "NoMad",
      "SoHo",
      "Tribeca",
      "Turtle Bay",
      "Two Bridges",
      "Upper East Side",
      "Upper West Side",
      "West Harlem",
      "West Village",
      "Yorkville",
    ],
  },
  {
    title: "Brooklyn",
    neighborhoods: ["All of Brooklyn"],
  },
  {
    title: "Queens",
    neighborhoods: ["All of Queens"],
  },
  {
    title: "Bronx",
    neighborhoods: ["All of Bronx"],
  },
  {
    title: "Staten Island",
    neighborhoods: ["All of Staten Island"],
  },
];

const NeighborhoodButton: React.FC<NeighborhoodProps> = ({
  neighborhood,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.neighborhoodButton,
        isSelected && styles.neighborhoodButtonSelected,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.neighborhoodButtonText,
          isSelected && styles.neighborhoodButtonTextSelected,
        ]}
      >
        {neighborhood}
      </Text>
    </TouchableOpacity>
  );
};

type CategoryProps = {
  title: string;
  neighborhoods: string[];
  selectedNeighborhoods: string[];
  toggleNeighborhood: (neighborhood: string) => void;
};

const Category: React.FC<CategoryProps> = ({
  title,
  neighborhoods,
  selectedNeighborhoods,
  toggleNeighborhood,
}) => {
  return (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <View style={styles.neighborhoodsContainer}>
        {neighborhoods.map((neighborhood, index) => (
          <NeighborhoodButton
            key={index}
            neighborhood={neighborhood}
            isSelected={selectedNeighborhoods.includes(neighborhood)}
            onPress={() => toggleNeighborhood(neighborhood)}
          />
        ))}
      </View>
    </View>
  );
};

const Neighborhoods: React.FC = () => {
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>(
    []
  );

  const toggleNeighborhood = (neighborhood: string) => {
    if (selectedNeighborhoods.includes(neighborhood)) {
      setSelectedNeighborhoods(
        selectedNeighborhoods.filter((item) => item !== neighborhood)
      );
    } else if (selectedNeighborhoods.length < 5) {
      setSelectedNeighborhoods([...selectedNeighborhoods, neighborhood]);
    }
  };

  return (
    <ScrollView style={styles.parentContainer}>
      <Text style={styles.explanationTitle}>
        Select up to five other neighborhoods to pick between on your feed. More
        neighborhoods on the way 👀
      </Text>
      {neighborhoodsData.map((category, index) => (
        <Category
          key={index}
          title={category.title}
          neighborhoods={category.neighborhoods}
          selectedNeighborhoods={selectedNeighborhoods}
          toggleNeighborhood={toggleNeighborhood}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  parentContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.switchFontColor,
    marginBottom: 20,
    textAlign: "center",
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  neighborhoodsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  neighborhoodButton: {
    backgroundColor: "white",
    borderRadius: 20,
    borderColor: Colors.light.neighborhoodButtonColor,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
  },
  neighborhoodButtonSelected: {
    backgroundColor: "black",
  },
  neighborhoodButtonText: {
    fontSize: 14,
    color: Colors.light.neighborhoodButtonColor,
    fontWeight: "bold",
  },
  neighborhoodButtonTextSelected: {
    color: "white",
  },
});

export default Neighborhoods;
