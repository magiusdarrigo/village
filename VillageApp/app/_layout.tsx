import "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";
import AuthContextProvider from "../context/AuthContext";
import UserContextProvider from "../context/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TweetsApiContextProvider from "../context/TweetContext";
import { CURRENT_APP_VERSION } from "../lib/api/config";
import { checkAppVersion } from "../lib/api/auth";
import { StreamChat, Channel as ChannelType } from "stream-chat";
import { STREAM_CHAT_API_KEY } from "../lib/api/config";
import messaging from "@react-native-firebase/messaging";

const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

console.log("main layout file run");

// create the stream chat client
const streamChatClient = StreamChat.getInstance(STREAM_CHAT_API_KEY);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
    DynaPuff: require("../assets/fonts/DynaPuff_SemiCondensed-Bold.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    // call register device for push notifications here
    const registerDeviceForPushNotifications = async () => {
      try {
        await messaging().registerDeviceForRemoteMessages();
      } catch (error) {
        console.log("register device for push notifications ERROR: ", error);
      }
    };
    // call version check here
    const checkVersion = async () => {
      const { mandatoryUpdate, latestVersion } = await checkAppVersion();
      if (mandatoryUpdate && latestVersion !== CURRENT_APP_VERSION) {
        Alert.alert(
          "Update Required",
          "Please update Village to the latest version."
        );
      }
    };
    registerDeviceForPushNotifications();
    checkVersion();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <>
      <UserContextProvider streamChatClient={streamChatClient}>
        <AuthContextProvider>
          <TweetsApiContextProvider>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider value={DefaultTheme}>
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="profile/[id]"
                    options={{ presentation: "modal" }}
                  />
                  <Stack.Screen name="tweet/[id]" options={{ title: "Post" }} />
                  <Stack.Screen
                    name="new-tweet"
                    options={{ title: "New Post", headerShown: true }}
                  />
                  <Stack.Screen
                    name="(auth)/signIn"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(auth)/authenticate"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(auth)/createProfile"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(auth)/pickBuilding"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(auth)/pickNeighborhood"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(auth)/showNeighborhood"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </ThemeProvider>
            </QueryClientProvider>
          </TweetsApiContextProvider>
        </AuthContextProvider>
      </UserContextProvider>
    </>
  );
}
