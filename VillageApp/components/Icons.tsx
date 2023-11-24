import React from "react";
import { View, Text } from "react-native";
import {
  EvilIcons,
  AntDesign,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";

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

type AntIconProps = {
  icon: React.ComponentProps<typeof AntDesign>["name"];
  text?: string | number;
  iconColor?: string;
  size: number;
};

export const AntIcon = ({ icon, text, iconColor, size }: AntIconProps) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <AntDesign name={icon} size={size} color={iconColor} />
      <Text style={{ fontSize: 12, color: "grey", marginLeft: 5 }}>{text}</Text>
    </View>
  );
};

type MaterialCommunityIconsProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  text?: string | number;
  iconColor?: string;
  size?: number;
};

export const MaterialCommunityIcon = ({
  icon,
  text,
  iconColor,
  size,
}: MaterialCommunityIconsProps) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <MaterialCommunityIcons name={icon} size={size ?? 18} color={iconColor} />
      <Text style={{ fontSize: 12, color: "grey", marginLeft: 5 }}>{text}</Text>
    </View>
  );
};

type IoniconsIconProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text?: string | number;
  iconColor?: string;
  size?: number;
};

export const IoniconsIcon = ({
  icon,
  text,
  iconColor,
  size,
}: IoniconsIconProps) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Ionicons name={icon} size={size ?? 18} color={iconColor} />
      <Text style={{ fontSize: 12, color: "grey", marginLeft: 5 }}>{text}</Text>
    </View>
  );
};
