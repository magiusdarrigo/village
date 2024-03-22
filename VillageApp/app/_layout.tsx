import "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";
import AuthContextProvider from "../context/AuthContext";
import UserContextProvider from "../context/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TweetsApiContextProvider from "../context/TweetContext";
import { CURRENT_APP_VERSION, SENTRY_DSN } from "../lib/api/config";
import { checkAppVersion } from "../lib/api/auth";
import { StreamChat, Channel as ChannelType } from "stream-chat";
import { STREAM_CHAT_API_KEY } from "../lib/api/config";
import { isIOSSimulator } from "../lib/helpers";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import * as Linking from "expo-linking";
import * as Sentry from "sentry-expo";

const queryClient = new QueryClient();

Sentry.init({
  dsn: SENTRY_DSN,
  enableInExpoDevelopment: true,
  enableNative: isIOSSimulator() ? false : true,
  debug: false,
});

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

// create the stream chat client
const streamChatClient = StreamChat.getInstance(STREAM_CHAT_API_KEY);

// This function would contain logic to navigate to the correct screen based on the URL
function navigateToRoute(url: string) {
  // Parse the URL and navigate to the correct screen
  // You'll use your navigation logic here depending on how you have set up routing
  const { path, queryParams } = Linking.parse(url);
  // Example: navigate to the path with queryParams
}

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
    checkVersion();
  }, [loaded]);

  useEffect(() => {
    // Handle the initial URL
    async function handleInitialURL() {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        console.log(`Opened with URL: ${initialURL}`);
        navigateToRoute(initialURL); // Implement this function based on your navigation logic
      }
    }

    handleInitialURL();

    // Subscribe to deep link events
    const subscription = Linking.addEventListener("url", (event) => {
      console.log(`Opened with URL: ${event.url}`);
      navigateToRoute(event.url); // Implement this function based on your navigation logic
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
                <ActionSheetProvider>
                  <Stack>
                    <Stack.Screen
                      name="tabs/(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="profile/[id]" options={{}} />
                    <Stack.Screen
                      name="tweet/[id]"
                      options={{ title: "Post" }}
                    />
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
                </ActionSheetProvider>
              </ThemeProvider>
            </QueryClientProvider>
          </TweetsApiContextProvider>
        </AuthContextProvider>
      </UserContextProvider>
    </>
  );
}
