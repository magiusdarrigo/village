import { Text, StyleSheet, Platform } from "react-native";
import * as Device from "expo-device";

export const calculateHoursAgo = (time: string) => {
  const now = new Date();
  const date = new Date(time);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return <Text style={styles.time}>· {seconds}s</Text>;
  } else if (minutes < 60) {
    return <Text style={styles.time}>· {minutes}m</Text>;
  } else if (hours < 24) {
    return <Text style={styles.time}>· {hours}h</Text>;
  } else {
    const dateWithoutYear = date
      .toDateString()
      .split(" ")
      .slice(0, 3)
      .join(" ");
    return <Text style={styles.time}>· {dateWithoutYear}</Text>;
  }
};

const styles = StyleSheet.create({
  time: {
    color: "grey",
    marginLeft: 5,
  },
});

export const isIOSSimulator = () => {
  return Platform.OS === "ios" && !Device.isDevice;
};
