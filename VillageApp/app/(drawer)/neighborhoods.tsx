import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Colors from "../../constants/Colors";
import {
  ManhattanNeighborhoods,
  BrooklynNeighborhoods,
  QueensNeighborhoods,
  BronxNeighborhoods,
  StatenIslandNeighborhoods,
} from "../../constants/Neighborhoods";
import { useUser } from "../../context/UserContext";

type NeighborhoodProps = {
  neighborhood: string;
  isSelected: boolean;
  onPress: () => void;
};

const neighborhoodsData = [
  {
    title: "Manhattan",
    neighborhoods: ManhattanNeighborhoods,
  },
  {
    title: "Brooklyn",
    neighborhoods: BrooklynNeighborhoods,
  },
  {
    title: "Queens",
    neighborhoods: QueensNeighborhoods,
  },
  {
    title: "Bronx",
    neighborhoods: BronxNeighborhoods,
  },
  {
    title: "Staten Island",
    neighborhoods: StatenIslandNeighborhoods,
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
  const { user } = useUser();
  if (user?.neighborhood?.name === undefined) {
    throw new Error("User neighborhood is undefined");
  }
  const currentNeighborhoods = [user?.neighborhood?.name];
  if (user?.selected_neighborhoods) {
    user.selected_neighborhoods.forEach((neighborhood) => {
      currentNeighborhoods.push(neighborhood.name);
    });
  }
  const [selectedNeighborhoods, setSelectedNeighborhoods] =
    useState<string[]>(currentNeighborhoods);
  const [isLoading, setIsLoading] = useState(false);
  const didSelectionChange =
    selectedNeighborhoods.length !== currentNeighborhoods.length;

  const toggleNeighborhood = (neighborhood: string) => {
    if (neighborhood === user?.neighborhood?.name) {
      Alert.alert("You cannot remove the neighborhood you live in");
      return;
    }
    if (selectedNeighborhoods.includes(neighborhood)) {
      setSelectedNeighborhoods(
        selectedNeighborhoods.filter((item) => item !== neighborhood)
      );
    } else if (selectedNeighborhoods.length < 6) {
      setSelectedNeighborhoods([...selectedNeighborhoods, neighborhood]);
    }
  };

  const handleSave = () => {
    console.log("Selected Neighborhoods: ", selectedNeighborhoods);
    // Add your save functionality here
  };

  return (
    <>
      <ScrollView style={styles.parentContainer}>
        <Text style={styles.explanationTitle}>
          Select up to five other neighborhoods to pick between on your feed.
          More neighborhoods on the way 👀
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
        <View style={{ height: 100 }} />
      </ScrollView>
      <TouchableOpacity
        style={[
          styles.saveButton,
          isLoading || !didSelectionChange ? styles.saveButtonDisabled : {},
        ]}
        onPress={handleSave}
        disabled={isLoading || !didSelectionChange}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </>
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
  saveButton: {
    position: "absolute",
    bottom: 34,
    alignSelf: "center",
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: 140,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Neighborhoods;
