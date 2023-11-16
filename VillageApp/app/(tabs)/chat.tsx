import { ActivityIndicator, Alert } from "react-native";
import { StreamChat, Channel as ChannelType } from "stream-chat";
import { STREAM_CHAT_API_KEY } from "../../lib/api/config";
import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";

import {
  OverlayProvider,
  Chat,
  Channel,
  MessageInput,
  MessageList,
  useChatContext,
} from "stream-chat-expo";

const ChatScreen = () => {
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const { user, getStreamChatClient } = useUser();
  const { authToken } = useAuth();
  const streamChatClient = getStreamChatClient();

  useEffect(() => {
    const connectUserAndFetchChannel = async () => {
      try {
        await streamChatClient.connectUser(
          {
            id: String(user?.id),
            name: user?.username,
            image: user?.image,
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
      streamChatClient.disconnectUser();
    };
  }, [authToken, user]);

  if (!channel) {
    return <ActivityIndicator />;
  }

  return (
    <OverlayProvider>
      <Chat client={streamChatClient}>
        {/* <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text>Chat Screen</Text>
        </View> */}
        <Channel channel={channel}>
          <MessageList />
          <MessageInput />
        </Channel>
      </Chat>
    </OverlayProvider>
  );
};

export default ChatScreen;
