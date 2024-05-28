import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useUser } from "../context/UserContext";
import neighborhoodStyles from "../lib/styles/neighborhood";
import { NeighborhoodType } from "../types";

const NeighborhoodScrollPicker = () => {
  const { user, updateActiveNeighborhoodFeed } = useUser();
  const currentNeighborhoods = [
    { name: user?.neighborhood?.name, id: user?.neighborhood_id },
  ];
  if (user?.selected_neighborhoods) {
    user.selected_neighborhoods.forEach((neighborhood) => {
      currentNeighborhoods.push(neighborhood);
    });
  }
  const isSelected = false;

  const pressOnItem = (item: NeighborhoodType) => {
    console.log(item);
    updateActiveNeighborhoodFeed(item);
  };

  if (currentNeighborhoods.length <= 1) {
    return null;
  }

  return (
    <View style={styles.scrollParentContainer}>
      <View style={{ height: 44 }}>
        <FlatList
          showsHorizontalScrollIndicator={false}
          horizontal
          data={currentNeighborhoods}
          renderItem={({ item }: any) => (
            <TouchableOpacity
              style={[
                neighborhoodStyles.neighborhoodButton,
                // { borderColor: !isSelected ? "black" : "white" },
                isSelected && neighborhoodStyles.neighborhoodButtonSelected,
              ]}
              key={item.id}
              onPress={() => pressOnItem(item)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  neighborhoodStyles.neighborhoodButtonText,
                  // { color: !isSelected ? "black" : "white" },
                  isSelected &&
                    neighborhoodStyles.neighborhoodButtonTextSelected,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollParentContainer: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    height: 30,
    width: "100%",
    justifyContent: "center",
    zIndex: 5,
  },
});

export default NeighborhoodScrollPicker;
