import "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { Alert, Text } from "react-native";
import AuthContextProvider from "../context/AuthContext";
import UserContextProvider from "../context/UserContext";
import AssetsContextProvider from "../context/AssetsContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TweetsApiContextProvider from "../context/TweetContext";
import {
  CURRENT_APP_VERSION,
  SENTRY_DSN,
  STREAM_CHAT_API_KEY,
  VEXO_API_KEY,
} from "../lib/api/config";
import { checkAppVersion } from "../lib/api/auth";
import { StreamChat } from "stream-chat";
import { isIOSSimulator } from "../lib/helpers";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import * as Sentry from "sentry-expo";
import DeepLinkHandler from "../components/DeepLinkHandler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { vexo } from "vexo-analytics";

vexo(VEXO_API_KEY);
const queryClient = new QueryClient();

Sentry.init({
  dsn: SENTRY_DSN,
  enableInExpoDevelopment: true,
  enableNative: isIOSSimulator() ? false : true,
  debug: false,
});

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// @ts-ignore
Text.defaultProps = { ...(Text.defaultProps || {}), allowFontScaling: false };

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
      <AssetsContextProvider>
        <UserContextProvider streamChatClient={streamChatClient}>
          <AuthContextProvider>
            <TweetsApiContextProvider>
              <QueryClientProvider client={queryClient}>
                <ThemeProvider value={DefaultTheme}>
                  <ActionSheetProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <Stack>
                        <Stack.Screen
                          name="(drawer)"
                          options={{
                            headerShown: false,
                            headerBackTitleVisible: false,
                            headerTintColor: "black",
                          }}
                        />
                        <Stack.Screen
                          name="profile/[id]"
                          options={{
                            headerBackTitleVisible: false,
                            headerTintColor: "black",
                          }}
                        />
                        <Stack.Screen
                          name="tweet/[id]"
                          options={{
                            title: "post",
                            headerBackTitleVisible: false,
                            headerTintColor: "black",
                          }}
                        />
                        <Stack.Screen
                          name="new-tweet"
                          options={{
                            title: "new post",
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
                          name="(auth)/waitlist"
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
                        <Stack.Screen
                          name="(auth)/notifications"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(auth)/contacts"
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
      </AssetsContextProvider>
    </>
  );
}
