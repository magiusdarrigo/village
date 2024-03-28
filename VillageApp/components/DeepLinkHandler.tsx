import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

function DeepLinkHandler() {
  const router = useRouter();
  const { authToken } = useAuth();
  // useEffect(() => {
  //   const handleDeepLink = (event: Linking.EventType) => {
  //     if (event.url) {
  //       const { path, queryParams } = Linking.parse(event.url);
  //       console.log(
  //         `Deep link to path: ${path} with data: ${JSON.stringify(queryParams)}`
  //       );
  //       console.log("Auth token: ", authToken);
  //       // Use a dynamic route parameter based on the actual URL
  //       if (path) {
  //         router.push({
  //           pathname: "/tweet/[id]",
  //           params: { id: "41" },
  //         });
  //       }
  //     }
  //   };
  //   // Listen for incoming links
  //   const sub = Linking.addEventListener("url", handleDeepLink);
  //   // Handle the initial URL
  //   Linking.getInitialURL().then((url) => {
  //     if (url) {
  //       handleDeepLink({ url });
  //     }
  //   });
  //   return () => {
  //     // Clean up the event listener
  //     sub.remove();
  //   };
  // }, [authToken]);
  return null;
}

export default DeepLinkHandler;
