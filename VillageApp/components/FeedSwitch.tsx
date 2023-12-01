import React from "react";
import { StyleSheet, Pressable, Text, View } from "react-native";

type FeedSwitchProps = {
  isHot: boolean;
  setIsHot: React.Dispatch<React.SetStateAction<boolean>>;
};

const FeedSwitch = ({ isHot, setIsHot }: FeedSwitchProps) => (
  <View style={feedSwitchStyles.parentContainer}>
    <Pressable
      style={[
        feedSwitchStyles.switchButton,
        isHot ? feedSwitchStyles.active : null,
      ]}
      onPress={() => setIsHot(true)}
    >
      <Text
        style={[
          feedSwitchStyles.switchButtonText,
          isHot ? feedSwitchStyles.activeText : null,
        ]}
      >
        Hot
      </Text>
    </Pressable>
    <Pressable
      style={[
        feedSwitchStyles.switchButton,
        !isHot ? feedSwitchStyles.active : null,
      ]}
      onPress={() => setIsHot(false)}
    >
      <Text
        style={[
          feedSwitchStyles.switchButtonText,
          !isHot ? feedSwitchStyles.activeText : null,
        ]}
      >
        New
      </Text>
    </Pressable>
  </View>
);

export const feedSwitchStyles = StyleSheet.create({
  feedSwitch: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
    borderRadius: 20,
    overflow: "hidden",
    // shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    borderColor: "grey",
    borderWidth: StyleSheet.hairlineWidth,
  },
  parentContainer: {
    flexDirection: "row",
  },
  switchButton: {
    backgroundColor: "white",
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  switchButtonText: {
    fontWeight: "bold",
    color: "black",
  },
  active: {
    backgroundColor: "black",
  },
  activeText: {
    color: "white",
  },
});

export default FeedSwitch;
