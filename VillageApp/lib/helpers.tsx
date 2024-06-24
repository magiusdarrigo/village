import { Text, Platform, Alert, Dimensions } from "react-native";
import postStyles from "./styles/post";
import * as Device from "expo-device";
import * as WebBrowser from "expo-web-browser";
import * as Sentry from "sentry-expo";
import * as ImagePicker from "expo-image-picker";

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
      .join(" ")
      .toLowerCase();
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

export const handleChooseCustomImage = async (
  setImage?: (value: React.SetStateAction<string | undefined>) => void
) => {
  try {
    // Ask for permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required. Try again.");
      return;
    }

    // Pick image
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });
    if (pickerResult.canceled === true) {
      return;
    }
    if (pickerResult.assets.length === 0) {
      return;
    }
    if (setImage) {
      setImage(pickerResult.assets[0].uri);
    }
    return pickerResult.assets[0].uri;
  } catch (error) {
    Sentry.Native.captureException(error);
    Alert.alert("We had an issue uploading your image. Try again.");
  }
};

export enum DeviceType {
  iPhoneSmall,
  iPhoneMedium,
  iPhoneLarge,
}

export const getDeviceType = (): DeviceType => {
  const { width } = Dimensions.get("window");
  if (width <= 375) {
    return DeviceType.iPhoneSmall;
  } else if (width <= 390) {
    return DeviceType.iPhoneMedium;
  } else {
    return DeviceType.iPhoneLarge;
  }
};

export const stripParentheses = (text: string) => {
  return text.replace(/[()]/g, "");
};

export const addParenthesesToPhoneNumber = (text: string) => {
  return `(${text.slice(0, 3)})${text.slice(3)}`;
};

// format phone number from 1234567890 to (123) 456-7890
export const formatPhoneNumber = (text: string) => {
  return `(${text.slice(0, 3)}) ${text.slice(3, 6)}-${text.slice(6)}`;
};

// +1 (123) 456-7890 -> +1 (123) 456-7890
// +11234567890 -> +1 (123) 456-7890
// 1234567890 -> +1 (123) 456-7890
// +57 123 456 7890 -> +57 (123) 456-7890
export const getDDBReadableNumber = (text: any) => {
  if (!text) {
    return "";
  }
  // strip all non-numeric characters
  const numbers = text.replace(/\D/g, "");
  // collect the last 10 digits
  let lastTenDigits = numbers.slice(-10);
  if (lastTenDigits.length !== 10) {
    return "";
  }
  // anything left over is the country code. If there are no digits left over, default to +1
  const countryCode = numbers.slice(0, -10) || "1";
  // format the last ten digits
  lastTenDigits = formatPhoneNumber(lastTenDigits);
  return `+${countryCode} ${lastTenDigits}`;
};

export const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export const truncateText = (message: string, length: number) => {
  return message.length > length ? message.slice(0, length) + "..." : message;
};
