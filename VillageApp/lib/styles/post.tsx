import { StyleSheet } from "react-native";

const postStyles = StyleSheet.create({
  parentContainer: {
    flexDirection: "column",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "lightgrey",
    backgroundColor: "white",
  },
  imageParentContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    flex: 1,
  },
  imageContainer: {
    width: 60,
    flexDirection: "column",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textContent: {
    lineHeight: 24,
    marginTop: 5,
    fontSize: 18,
    fontWeight: "700",
    marginRight: 10,
  },
  timeContent: {
    fontSize: 16,
    color: "grey",
    fontWeight: "600",
    marginLeft: 5,
  },
  postFooter: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 10,
    width: 260,
    justifyContent: "space-between",
    marginLeft: 70,
  },
  commentFooter: {
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
