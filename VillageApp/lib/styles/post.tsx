import { StyleSheet } from "react-native";

const postStyles = StyleSheet.create({
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textContent: {
    lineHeight: 20,
    marginTop: 5,
    fontSize: 15,
    fontWeight: "500",
  },
  timeContent: {
    fontSize: 16,
    color: "grey",
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 0,
    width: 120,
    justifyContent: "space-between",
  },
});

export default postStyles;
