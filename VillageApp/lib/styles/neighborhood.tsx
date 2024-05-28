import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";

const neighborhoodStyles = StyleSheet.create({
  neighborhoodButton: {
    backgroundColor: Colors.light.switchBackgroundColor,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 5,
    // shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 2.11,
    elevation: 3,
  },
  neighborhoodButtonSelected: {
    backgroundColor: "black",
  },
  neighborhoodButtonText: {
    fontSize: 14,
    color: Colors.light.switchFontColor,
    fontWeight: "bold",
  },
  neighborhoodButtonTextSelected: {
    color: "white",
  },
});

export default neighborhoodStyles;
