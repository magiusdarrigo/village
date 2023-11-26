import { StyleSheet } from "react-native";

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
  buttonDisabled: {
    opacity: 0.5,
  },
  cameraIconContainer: {
    position: "absolute",
    backgroundColor: "black",
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    paddingTop: 2,
    paddingLeft: 6,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default onboardingStyles;
