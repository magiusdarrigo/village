import { StyleSheet } from "react-native";
import Colors from "../../constants/Colors";

const profileStyles = StyleSheet.create({
  followButton: {
    marginVertical: 8,
    backgroundColor: "black",
    borderRadius: 50,
    padding: 5,
    paddingHorizontal: 15,
    width: 120,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  followButtonText: {
    fontWeight: "800",
    color: "white",
    fontSize: 14,
  },
  unfollowButton: {
    marginVertical: 8,
    backgroundColor: "transparent",
    borderRadius: 50,
    padding: 5,
    paddingHorizontal: 15,
    borderColor: "lightgrey",
    borderWidth: 1,
    width: 120,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  unfollowButtonText: {
    fontWeight: "800",
    color: "black",
    fontSize: 14,
  },
  bio: {
    lineHeight: 20,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.light.switchFontColor,
  },
  followButtonContainer: {
    backgroundColor: "transparent",
  },

  cancelButton: {
    marginVertical: 8,
    backgroundColor: "transparent",
    borderRadius: 50,
    padding: 5,
    paddingHorizontal: 15,
    borderColor: "lightgrey",
    borderWidth: 1,
    width: 120,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontWeight: "600",
    color: Colors.light.cancelRed,
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  profileHeader: {
    alignItems: "center",
    marginVertical: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIconContainer: {
    position: "absolute",
    backgroundColor: "black",
    width: 120,
    height: 120,
    borderRadius: 60,
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
  username: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 8,
  },
  countContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 8,
  },
  countText: {
    fontSize: 16,
  },
  tweetsContainer: {
    flex: 1,
  },
  tweet: {
    width: "90%",
    backgroundColor: "lightgrey",
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
  },
});

export default profileStyles;
