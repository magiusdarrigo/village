import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import * as Linking from "expo-linking";
import { useRouter, useRootNavigationState } from "expo-router";

function DeepLinkHandler() {
  const router = useRouter();
  const { authToken } = useAuth();
  const { user } = useUser();
  const navigationState = useRootNavigationState();
  useEffect(() => {
    // if (!navigationState?.key) return;
    const handleDeepLink = (event: Linking.EventType) => {
      if (event.url && authToken && user) {
        const { hostname, path, queryParams } = Linking.parse(event.url);
        console.log(
          `Linked to app with hostname: ${hostname}, path: ${path} and data: ${JSON.stringify(
            queryParams
          )}`
        );
        // Use a dynamic route parameter based on the actual URL
        if (path) {
          // first take user to the home screen
          router.replace({
            pathname: "/tabs",
          });
          router.push({
            pathname: path,
            params: queryParams ?? {},
          } as any);
        }
      }
    };
    // Listen for incoming links
    const sub = Linking.addEventListener("url", handleDeepLink);
    // Handle the initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });
    return () => {
      // Clean up the event listener
      sub.remove();
    };
  }, [authToken, user, navigationState]);
  return null;
}

export default DeepLinkHandler;
