import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";

const onboardingStyles = StyleSheet.create({
  label: {
    marginTop: 36, // space above the label
    fontSize: 36,
    marginBottom: 8, // space below the label
    color: "black",
    fontWeight: "bold",
    alignSelf: "flex-start", // align to top-left
  },
  button: {
    backgroundColor: "#050A12",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginTop: 5, // space above the button
    marginBottom: 25, // space below the button
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default onboardingStyles;
