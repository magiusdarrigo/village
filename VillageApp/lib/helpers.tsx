import { Text, StyleSheet, Platform } from "react-native";
import postStyles from "./styles/post";
import * as Device from "expo-device";

export const calculateHoursAgo = (time: string) => {
  const now = new Date();
  const date = new Date(time);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return <Text style={postStyles.timeContent}>· {seconds}s</Text>;
  } else if (minutes < 60) {
    return <Text style={postStyles.timeContent}>· {minutes}m</Text>;
  } else if (hours < 24) {
    return <Text style={postStyles.timeContent}>· {hours}h</Text>;
  } else {
    const dateWithoutYear = date
      .toDateString()
      .split(" ")
      .slice(0, 3)
      .join(" ");
    return <Text style={postStyles.timeContent}>· {dateWithoutYear}</Text>;
  }
};

export const isIOSSimulator = () => {
  return Platform.OS === "ios" && !Device.isDevice;
};
