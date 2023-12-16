import React, { createContext, useContext, useState, useRef } from "react";
import { StreamChat, Channel as ChannelType } from "stream-chat";
import { FlatList } from "react-native";
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
  flatListRef?: React.RefObject<any>;
  scrollToTop: () => void;
  updateChannel: (channel: ChannelType) => void;
  channel: ChannelType | null;
  isFeedHot: boolean;
  updateIsFeedHot: (isHot: boolean) => void;
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
  const [isFeedHot, setIsFeedHot] = useState(true);
  const [chatTabBadgeCount, setChatTabBadgeCount] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);
  const [channel, setChannel] = useState<ChannelType | null>(null);

  const updateIsFeedHot = (isHot: boolean) => {
    setIsFeedHot(isHot);
  };

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

  const scrollToTop = () => {
    flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  const updateChannel = (channel: ChannelType) => {
    setChannel(channel);
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
        flatListRef,
        scrollToTop,
        updateChannel,
        channel,
        isFeedHot,
        updateIsFeedHot,
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
