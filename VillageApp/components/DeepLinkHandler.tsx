import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

function DeepLinkHandler() {
  //   const url = Linking.useURL();
  //   const router = useRouter();
  //   const { authToken } = useAuth();

  //   useEffect(() => {
  //     console.log("DeepLinkHandler mounted");
  //     if (url && authToken) {
  //       const { hostname, path, queryParams } = Linking.parse(url);

  //       console.log(
  //         `Linked to app with hostname: ${hostname}, path: ${path} and data: ${JSON.stringify(
  //           queryParams
  //         )}`
  //       );
  //       console.log("authToken: ", authToken);

  //       //   router.push({
  //       //     pathname: "/tweet/[id]",
  //       //     params: { id: "41" },
  //       //   });
  //     }
  //   }, [url, authToken]);

  return null;
}

export default DeepLinkHandler;
