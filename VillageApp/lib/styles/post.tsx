import { StyleSheet } from "react-native";

const postStyles = StyleSheet.create({
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textContent: {
    lineHeight: 24,
    marginTop: 5,
    fontSize: 18,
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
  emptyPostsContainer: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyPostsContainerText: {
    paddingHorizontal: 20,
    fontSize: 36,
    textAlign: "center",
    color: "lightgrey",
  },
  emptyCommentsContainer: {
    minHeight: 200,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCommentsContainerText: {
    paddingHorizontal: 20,
    fontSize: 28,
    textAlign: "center",
    color: "lightgrey",
  },
});

export default postStyles;
