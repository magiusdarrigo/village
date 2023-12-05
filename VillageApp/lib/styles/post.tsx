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
    marginRight: 10,
  },
  timeContent: {
    fontSize: 16,
    color: "grey",
    fontWeight: "500",
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 10,
    width: 175,
    justifyContent: "space-between",
    marginLeft: 70,
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 80,
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
