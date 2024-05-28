import React, { createContext, useContext, useState, useRef } from "react";
import { StreamChat, Channel as ChannelType } from "stream-chat";
import { FlatList } from "react-native";
import notifee from "@notifee/react-native";
import { NeighborhoodType, UserType } from "../types/index";

interface UserContextType {
  user: UserType | null;
  updateUser: (user: UserType) => void;
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
  activeTab: string;
  updateActiveTab: (tab: string) => void;
  activeNeighborhood: NeighborhoodType | null;
  updateActiveNeighborhood: (neighborhood: NeighborhoodType) => void;
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
  const [user, setUser] = useState<UserType | null>(null);
  const [isFeedHot, setIsFeedHot] = useState(true);
  const [chatTabBadgeCount, setChatTabBadgeCount] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [activeNeighborhood, setActiveNeighborhood] =
    useState<NeighborhoodType | null>(null);

  const updateActiveNeighborhood = (neighborhood: NeighborhoodType) => {
    setActiveNeighborhood(neighborhood);
  };

  const updateActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  const updateIsFeedHot = (isHot: boolean) => {
    setIsFeedHot(isHot);
  };

  const updateUser = (newUser: UserType) => {
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
        activeTab,
        updateActiveTab,
        activeNeighborhood,
        updateActiveNeighborhood,
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
