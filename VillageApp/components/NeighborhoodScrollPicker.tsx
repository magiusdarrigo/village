import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LabelScroller from "./LabelScroller";

const NeighborhoodScrollPicker = () => {
  const pressOnItem = (item: any) => {
    //do something with selected label
  };

  return (
    // <View style={styles.scrollParentContainer}>
    <View style={{ flex: 1, justifyContent: "center" }}>
      <LabelScroller
        rows={1}
        data={[
          { id: 1, label: "Lower East Side" },
          { id: 2, label: "West Village" },
          { id: 3, label: "SoHo" },
          { id: 4, label: "Lenox Hill" },
          { id: 5, label: "Murray Hill" },
          { id: 6, label: "Upper East Side" },
          { id: 7, label: "Hudson Yards" },
          { id: 8, label: "Chelsea" },
          { id: 9, label: "Midtown" },
          { id: 10, label: "Gramercy Park" },
          { id: 11, label: "East Village" },
          { id: 12, label: "Greenwich Village" },
          { id: 13, label: "Tribeca" },
          { id: 14, label: "Financial District" },
          { id: 15, label: "Williamsburg" },
        ]}
        renderItem={({ item, index }: any) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => pressOnItem(item)}
            style={styles.item}
            activeOpacity={0.8}
          >
            <Text style={styles.itemLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
        reverse={false}
        random={false}
      />
    </View>
    // </View>
  );
};

const styles = StyleSheet.create({
  scrollParentContainer: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    height: 50,
    width: "100%",
    justifyContent: "center",
    zIndex: 5,
    borderWidth: 1,
    borderColor: "red",
    backgroundColor: "white",
  },
  item: {
    padding: 5,
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    margin: 3,
  },
  itemLabel: {},
  itemImage: {
    width: 20,
    height: 40,
    marginHorizontal: 5,
  },
});

export default NeighborhoodScrollPicker;
