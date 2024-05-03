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
import * as Sentry from "sentry-expo";

interface AuthContextType {
  authToken: string | null;
  updateAuthToken: (newToken: string) => void;
  removeAuthToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthContextProvider = ({ children }: PropsWithChildren) => {
  const { user, updateUser } = useUser();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  const getUser = async (token: string) => {
    if (!token) {
      console.log("no authToken");
      return {};
    }
    const url = `${API_URL}/v1/users`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
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
    if (!isLoaded) {
      return;
    }

    if (
      (!authToken || !user?.neighborhood?.name) &&
      (segments[0] !== "(auth)" ||
        (segments[0] === "(auth)" && segments[1] === "[...missing]"))
    ) {
      router.replace("/signIn");
      return;
    }

    if (authToken && user?.neighborhood?.name && segments[0] === "(auth)") {
      router.replace("/tabs");
      return;
    }
  }, [segments, authToken, user, isLoaded]);

  useEffect(() => {
    const loadAuthToken = async () => {
      const token = await SecureStore.getItemAsync("authToken");
      if (token) {
        // console.log("user auth token: ", token);
        setAuthToken(token);
        if (!user) {
          try {
            const currentUser = await getUser(token);
            updateUser(currentUser);
          } catch (error) {
            Sentry.Native.captureException(error);
            Alert.alert("We couldn't sign you in. Try again.");
          }
        }
      }
      setIsLoaded(true);
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
