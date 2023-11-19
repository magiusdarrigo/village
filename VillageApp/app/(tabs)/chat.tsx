import { ActivityIndicator, Alert, ImageStyle, StyleProp } from "react-native";
import { Channel as ChannelType } from "stream-chat";
import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import messaging from "@react-native-firebase/messaging";

import {
  OverlayProvider,
  Chat,
  Channel,
  MessageInput,
  MessageList,
} from "stream-chat-expo";

const ChatScreen = () => {
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const { user, getStreamChatClient } = useUser();
  const streamChatClient = getStreamChatClient();

  // Request Push Notification permission from device.
  const requestPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
    const fcmToken = await messaging().getToken();
    console.log("FCM Token:", fcmToken);
  };

  useEffect(() => {
    const connectUserAndFetchChannel = async () => {
      try {
        // ask for push notification permission
        await requestPermission();
        // connect user to chat
        await streamChatClient.connectUser(
          {
            id: String(user?.id),
            name: user?.username,
          },
          user?.chat_token
        );
        // fetch channel
        const _id = String(user?.building_id);
        const channels = await streamChatClient.queryChannels({
          id: { $eq: _id },
        });
        const channel = channels[0];
        setChannel(channel);
        // watch channel for new messages
        await channel.watch();
      } catch (error) {
        console.log("ERROR: ", error);
        Alert.alert(
          "We had an issue adding you to your building chat. Try again."
        );
      }
    };

    connectUserAndFetchChannel();

    return () => {
      if (streamChatClient.userID) {
        streamChatClient.disconnectUser();
      }
    };
  }, []);

  if (!channel) {
    return <ActivityIndicator />;
  }

  return (
    <OverlayProvider>
      <Chat client={streamChatClient}>
        <Channel channel={channel}>
          <MessageList />
          <MessageInput />
        </Channel>
      </Chat>
    </OverlayProvider>
  );
};

export default ChatScreen;
