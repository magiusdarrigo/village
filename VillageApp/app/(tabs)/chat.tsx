import { ActivityIndicator, Alert, ImageStyle, StyleProp } from "react-native";
import { Channel as ChannelType } from "stream-chat";
import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";

import {
  OverlayProvider,
  Chat,
  Channel,
  MessageInput,
  MessageList,
} from "stream-chat-expo";

interface CustomImageProps {
  style?: StyleProp<ImageStyle>;
}

const ChatScreen = () => {
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const { user, getStreamChatClient } = useUser();
  const streamChatClient = getStreamChatClient();

  useEffect(() => {
    const connectUserAndFetchChannel = async () => {
      try {
        await streamChatClient.connectUser(
          {
            id: String(user?.id),
            name: user?.username,
          },
          user?.chat_token
        );

        const _id = String(user?.building_id);

        const channels = await streamChatClient.queryChannels({
          id: { $eq: _id },
        });
        const channel = channels[0];
        setChannel(channel);
        await channel.watch();
      } catch (error) {
        console.log("CHAT ERROR: ", error);
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
