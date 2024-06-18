import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import Colors from "../../constants/Colors";
import neighborhoodStyles from "../../lib/styles/neighborhood";
import {
  ManhattanNeighborhoods,
  BrooklynNeighborhoods,
  QueensNeighborhoods,
  BronxNeighborhoods,
  StatenIslandNeighborhoods,
} from "../../constants/Neighborhoods";
import * as Sentry from "sentry-expo";
import { useUser } from "../../context/UserContext";
import { useTweetsApi } from "../../context/TweetContext";
import { NeighborhoodType } from "../../types/index";

type NeighborhoodProps = {
  neighborhood: NeighborhoodType;
  isSelected: boolean;
  onPress: () => void;
};

const neighborhoodsData = [
  {
    title: "manhattan",
    neighborhoods: ManhattanNeighborhoods,
  },
  {
    title: "brooklyn",
    neighborhoods: BrooklynNeighborhoods,
  },
  {
    title: "queens",
    neighborhoods: QueensNeighborhoods,
  },
  {
    title: "bronx",
    neighborhoods: BronxNeighborhoods,
  },
  {
    title: "staten island",
    neighborhoods: StatenIslandNeighborhoods,
  },
];

const NeighborhoodButton = ({
  neighborhood,
  isSelected,
  onPress,
}: NeighborhoodProps) => {
  return (
    <TouchableOpacity
      style={[
        neighborhoodStyles.neighborhoodButton,
        isSelected && neighborhoodStyles.neighborhoodButtonSelected,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          neighborhoodStyles.neighborhoodButtonText,
          isSelected && neighborhoodStyles.neighborhoodButtonTextSelected,
        ]}
      >
        {neighborhood.name}
      </Text>
    </TouchableOpacity>
  );
};

type CategoryProps = {
  title: string;
  neighborhoods: NeighborhoodType[];
  selectedNeighborhoods: NeighborhoodType[];
  toggleNeighborhood: (neighborhood: NeighborhoodType) => void;
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
            isSelected={selectedNeighborhoods.some(
              (n) => n.name === neighborhood.name
            )}
            onPress={() => toggleNeighborhood(neighborhood)}
          />
        ))}
      </View>
    </View>
  );
};

const areArraysEqual = (arr1: any, arr2: any) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item: any, index: any) => item.name === arr2[index].name);
};

const Neighborhoods: React.FC = () => {
  const { updateUserAttributes } = useTweetsApi();
  const { user, updateUser } = useUser();
  if (
    user?.neighborhood?.name === undefined ||
    user?.neighborhood_id === undefined
  ) {
    throw new Error("User neighborhood is undefined");
  }
  const currentNeighborhoods = [
    { name: user?.neighborhood?.name, id: user?.neighborhood_id },
  ];
  if (user?.selected_neighborhoods) {
    user.selected_neighborhoods.forEach((neighborhood) => {
      currentNeighborhoods.push(neighborhood);
    });
  }
  const [selectedNeighborhoods, setSelectedNeighborhoods] =
    useState<NeighborhoodType[]>(currentNeighborhoods);
  const [isLoading, setIsLoading] = useState(false);
  const didSelectionChange = !areArraysEqual(
    selectedNeighborhoods,
    currentNeighborhoods
  );

  const toggleNeighborhood = (neighborhood: NeighborhoodType) => {
    if (neighborhood.name === user?.neighborhood?.name) {
      Alert.alert("You cannot remove the neighborhood you live in");
      return;
    }
    if (selectedNeighborhoods.some((n) => n.name === neighborhood.name)) {
      setSelectedNeighborhoods(
        selectedNeighborhoods.filter((item) => item.name !== neighborhood.name)
      );
    } else if (selectedNeighborhoods.length < 6) {
      setSelectedNeighborhoods([...selectedNeighborhoods, neighborhood]);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // remove current neighborhood from selected neighborhoods
      const filteredNeighborhoods = selectedNeighborhoods.filter(
        (n) => n.name !== user?.neighborhood?.name
      );
      const updatedUser = await updateUserAttributes({
        selectedNeighborhoods: filteredNeighborhoods,
      });
      updateUser(updatedUser);
    } catch (error) {
      console.error(error);
      Sentry.Native.captureException(error);
      Alert.alert(
        "An error occurred while saving your neighborhoods. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.parentContainer}>
        <Text style={styles.explanationTitle}>
          select up to five other neighborhoods to pick between on your feed.
          more neighborhoods on the way 👀
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
      <Pressable
        style={[
          styles.saveButton,
          isLoading || !didSelectionChange ? styles.saveButtonDisabled : {},
        ]}
        onPress={handleSave}
        disabled={isLoading || !didSelectionChange}
      >
        <Text style={styles.saveButtonText}>save</Text>
      </Pressable>
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
    fontWeight: "600",
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
  saveButton: {
    position: "absolute",
    bottom: 35,
    left: 20,
    right: 20,
    backgroundColor: "black",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
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
