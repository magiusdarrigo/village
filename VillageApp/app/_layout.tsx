import "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { useColorScheme, Alert } from "react-native";
import AuthContextProvider from "../context/AuthContext";
import UserContextProvider from "../context/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TweetsApiContextProvider from "../lib/api/tweets";
import { CURRENT_APP_VERSION } from "../lib/api/config";
import { checkAppVersion } from "../lib/api/auth";

const client = new QueryClient();

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
  const colorScheme = useColorScheme();

  return (
    <>
      <UserContextProvider>
        <AuthContextProvider>
          <TweetsApiContextProvider>
            <QueryClientProvider client={client}>
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
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
                    options={{ title: "New Tweet", headerShown: false }}
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
                </Stack>
              </ThemeProvider>
            </QueryClientProvider>
          </TweetsApiContextProvider>
        </AuthContextProvider>
      </UserContextProvider>
    </>
  );
}
