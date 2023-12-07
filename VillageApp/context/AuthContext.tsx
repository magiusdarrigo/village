import {
  useRouter,
  useSegments,
  SplashScreen,
  useNavigation,
} from "expo-router";
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
    if (authToken && !user) {
      const getCurrentUser = async () => {
        try {
          const currentUser = await getUser();
          updateUser(currentUser);
        } catch (error) {
          Sentry.Native.captureException(error);
          Alert.alert("We couldn't sign you in. Try again.");
        }
      };

      getCurrentUser();
      return;
    }

    if ((!authToken || !user?.neighborhood?.name) && segments[0] !== "(auth)") {
      router.replace("/signIn");
      return;
    }

    if (authToken && user?.neighborhood?.name && segments[0] === "(auth)") {
      router.replace("/");
      return;
    }
  }, [segments, authToken, user]);

  useEffect(() => {
    const loadAuthToken = async () => {
      const res = await SecureStore.getItemAsync("authToken");
      if (res) {
        setAuthToken(res);
      }
    };
    loadAuthToken();
  }, []);

  // set a timeout to go off in 1 second
  useEffect(() => {
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);
    return () => clearTimeout(timeout);
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
