import React from "react";
import { View, Text } from "react-native";
import { EvilIcons, AntDesign } from "@expo/vector-icons";

type EvilIconProps = {
  icon: React.ComponentProps<typeof EvilIcons>["name"];
  text?: string | number;
  iconColor?: string;
};

export const EvilIcon = ({ icon, text, iconColor }: EvilIconProps) => {
  if (!iconColor) {
    iconColor = "grey";
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <EvilIcons
        name={icon}
        size={22}
        color={iconColor}
        iconStyle={{ fill: "red" }}
      />
      <Text style={{ fontSize: 12, color: "grey" }}>{text}</Text>
    </View>
  );
};

// add

type AntIconProps = {
  icon: React.ComponentProps<typeof AntDesign>["name"];
  text?: string | number;
  iconColor?: string;
};

export const AntIcon = ({ icon, text, iconColor }: AntIconProps) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <AntDesign name={icon} size={18} color={iconColor} />
      <Text style={{ fontSize: 12, color: "grey", marginLeft: 5 }}>{text}</Text>
    </View>
  );
};
