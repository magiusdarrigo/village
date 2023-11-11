import { View, Text, ActivityIndicator } from "react-native";
import { StreamChat, Channel as ChannelType } from "stream-chat";
import { STREAM_CHAT_API_KEY } from "../../lib/api/config";
import { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
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

const client = StreamChat.getInstance(STREAM_CHAT_API_KEY);

const ChatScreen = () => {
  const navigation = useNavigation();
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const { user } = useUser();
  const { authToken } = useAuth();
  useEffect(() => {
    // connect the user to the chat
    const connectUser = async () => {
      await client.connectUser(
        {
          id: String(user?.id),
          name: user?.username,
          image: user?.image,
        },
        client.devToken(String(user?.id))
      );

      // const channel = client.channel("messaging", String(user?.building_id), {
      //   name: user?.building?.address,
      // });

      // await channel.create();

      return () => {
        client.disconnectUser();
      };
    };

    connectUser();
  }, []);

  useEffect(() => {
    const fetchChannel = async () => {
      const _id = String(user?.building_id);
      const channels = await client.queryChannels({ id: { $eq: _id } });
      setChannel(channels[0]);
    };

    fetchChannel();
  }, [authToken, user]);

  useEffect(() => {
    navigation.setOptions({
      title: channel?.data?.name,
    });
  }, [channel]);

  if (!channel) {
    return <ActivityIndicator />;
  }

  return (
    <OverlayProvider>
      <Chat client={client}>
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
