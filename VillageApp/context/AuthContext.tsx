import { useRouter, useSegments } from "expo-router";
import {
  PropsWithChildren,
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useUser } from "./UserContext";
import { API_URL } from "../lib/api/config";

interface AuthContextType {
  authToken: string | null;
  updateAuthToken: (newToken: string) => void;
  removeAuthToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthContextProvider = ({ children }: PropsWithChildren) => {
  const { user, updateUser } = useUser();
  const [authToken, setAuthToken] = useState<string | null>(null);
  // const [authTokenLoaded, setAuthTokenLoaded] = useState<boolean>(false);
  const segments = useSegments();
  const router = useRouter();

  const getUser = async () => {
    if (!authToken) {
      return {};
    }
    const url = `${API_URL}/v1/users`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (res.status === 403) {
      removeAuthToken();
      return {};
    }

    if (res.status !== 200) {
      throw new Error("Error fetching user");
    }

    const body = await res.json();
    return body;
  };

  useEffect(() => {
    console.log("authToken", authToken);
    console.log("segments", segments);
    // Redirect to sign in if there is no auth token and user is not already on an auth-related route
    // authTokenLoaded &&
    if (!authToken && segments[0] !== "(auth)") {
      router.replace("/signIn");
      return;
    }

    // If there is an auth token, check if the user has neighborhood and building ids
    if (authToken) {
      if (user?.neighborhood_id && user?.building_id) {
        // If the user has both ids, redirect to home if they're not already there
        if (segments[0] === "(auth)") {
          router.replace("/");
        }
      } else {
        // If the user does not have both ids, fetch the user data
        const getCurrentUser = async () => {
          try {
            const currentUser = await getUser();
            console.log("currentUser", currentUser);
            // check if we have the necessary ids from the user
            if (currentUser?.neighborhood_id && currentUser?.building_id) {
              // Redirect to home if the user has both ids
              updateUser(currentUser);
              router.replace("/");
            } else {
              // Otherwise, let's create a new user if they're not already on an auth-related route
              if (segments[0] !== "(auth)") {
                router.replace("/signIn");
              }
            }
          } catch (error) {
            console.error("Failed to fetch current user:", error);
            Alert.alert("We couldn't sign you in. Try again.");
          }
        };

        getCurrentUser();
      }
    }
  }, [segments, authToken, user]);

  useEffect(() => {
    const loadAuthToken = async () => {
      const res = await SecureStore.getItemAsync("authToken");
      if (res) {
        setAuthToken(res);
        // setAuthTokenLoaded(true);
      }
    };
    loadAuthToken();
  }, []);

  const updateAuthToken = async (newToken: string) => {
    await SecureStore.setItemAsync("authToken", newToken);
    setAuthToken(newToken);
  };

  const removeAuthToken = async () => {
    await SecureStore.deleteItemAsync("authToken");
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ authToken, updateAuthToken, removeAuthToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
