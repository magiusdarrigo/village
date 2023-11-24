import { Text, Platform, Alert } from "react-native";
import postStyles from "./styles/post";
import * as Device from "expo-device";
import * as WebBrowser from "expo-web-browser";
import * as Sentry from "sentry-expo";

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

export const handlePressButtonAsync = async (url: string) => {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch (error) {
    Sentry.Native.captureException(error);
    Alert.alert("Sorry, this link is invalid");
  }
};
export const getFileType = (uri?: string) => {
  if (!uri) {
    return "";
  }
  const extension = uri.split(".").pop();
  if (!extension) {
    throw new Error("Unsupported file type");
  }
  switch (extension.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "heic":
      return "image/heic";
    default:
      throw new Error("Unsupported file type");
  }
};
