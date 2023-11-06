import { useRouter, useSegments } from "expo-router";
import {
  PropsWithChildren,
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import * as SecureStore from "expo-secure-store";
import { useUser } from "./UserContext";

interface AuthContextType {
  authToken: string | null;
  updateAuthToken: (newToken: string) => void;
  removeAuthToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthContextProvider = ({ children }: PropsWithChildren) => {
  const { user } = useUser();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const isAuthGroup = segments[0] === "(auth)";

    console.log("authToken", authToken);

    if (!authToken && !isAuthGroup) {
      // router.replace("/signIn");
      router.replace("/pickNeighborhood");
      return;
    }
    if (
      authToken &&
      isAuthGroup &&
      user?.neighborhood_id &&
      user?.building_id
    ) {
      router.replace("/");
      return;
    }
  }, [segments, authToken]);

  useEffect(() => {
    const loadAuthToken = async () => {
      const res = await SecureStore.getItemAsync("authToken");
      if (res) {
        setAuthToken(res);
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
