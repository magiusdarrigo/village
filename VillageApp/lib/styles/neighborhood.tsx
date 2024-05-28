import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";

const neighborhoodStyles = StyleSheet.create({
  neighborhoodButton: {
    backgroundColor: "white",
    borderRadius: 20,
    borderColor: Colors.light.neighborhoodButtonColor,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
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

export default neighborhoodStyles;
