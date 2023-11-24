import React, {
  createContext,
  useContext,
  useState,
  PropsWithChildren,
} from "react";
import { StreamChat, Channel as ChannelType } from "stream-chat";
import notifee from "@notifee/react-native";

export type User = {
  neighborhood_id?: number;
  neighborhood?: {
    name: string;
  };
  building?: {
    address: string;
  };
  building_id?: number;
  id: number;
  username: string;
  created_at?: string;
  followers_count?: number;
  following_count?: number;
  phone_number?: string;
  chat_token?: string;
  tags?: any;
  is_verified?: boolean;
  image?: string;
  followed_by_user?: boolean;
};

interface UserContextType {
  user: User | null;
  updateUser: (user: User) => void;
  removeUser: () => void;
  getStreamChatClient: () => StreamChat<any>;
  chatTabBadgeCount: number;
  updateChatTabBadgeCount: (count: number) => void;
}

interface UserContextProviderProps {
  children: React.ReactNode;
  streamChatClient: StreamChat<any>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// A component that provides the user context
const UserContextProvider = ({
  children,
  streamChatClient,
}: UserContextProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [chatTabBadgeCount, setChatTabBadgeCount] = useState<number>(0);

  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  const removeUser = () => {
    setUser(null);
  };

  const getStreamChatClient = () => {
    return streamChatClient;
  };

  const updateChatTabBadgeCount = async (count: number) => {
    await notifee.setBadgeCount(count);
    setChatTabBadgeCount(count);
  };

  // Provide the user object to any descendants of this component
  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        removeUser,
        getStreamChatClient,
        chatTabBadgeCount,
        updateChatTabBadgeCount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;

// A hook to help us consume the user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  }

  return context;
};
