import "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, SplashScreen, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";
import AuthContextProvider from "../context/AuthContext";
import UserContextProvider from "../context/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TweetsApiContextProvider from "../context/TweetContext";
import { CURRENT_APP_VERSION, SENTRY_DSN } from "../lib/api/config";
import { checkAppVersion } from "../lib/api/auth";
import { StreamChat } from "stream-chat";
import { STREAM_CHAT_API_KEY } from "../lib/api/config";
import { isIOSSimulator } from "../lib/helpers";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import * as Sentry from "sentry-expo";
import DeepLinkHandler from "../components/DeepLinkHandler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <Stack>
                      <Stack.Screen
                        name="tabs/(tabs)"
                        options={{
                          headerShown: false,
                          headerBackTitleVisible: false,
                          headerTintColor: "black",
                        }}
                      />
                      <Stack.Screen name="profile/[id]" options={{}} />
                      <Stack.Screen
                        name="tweet/[id]"
                        options={{
                          title: "Post",
                          headerBackTitleVisible: false,
                          headerTintColor: "black",
                        }}
                      />
                      <Stack.Screen
                        name="new-tweet"
                        options={{
                          title: "New Post",
                          headerShown: true,
                          headerBackTitleVisible: false,
                          headerTintColor: "black",
                        }}
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
                    <DeepLinkHandler />
                  </GestureHandlerRootView>
                </ActionSheetProvider>
              </ThemeProvider>
            </QueryClientProvider>
          </TweetsApiContextProvider>
        </AuthContextProvider>
      </UserContextProvider>
    </>
  );
}
