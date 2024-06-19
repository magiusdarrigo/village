import { Pressable } from "react-native";
import {
  DefaultStreamChatGenerics,
  MessageAvatar,
  MessageAvatarProps,
  MessageType,
  Reply,
  ReplyProps,
  useMessageContext,
} from "stream-chat-expo";
import { router } from "expo-router";

const openProfile = (message: MessageType<DefaultStreamChatGenerics>) => {
  if (!message?.user?.id || !message?.user?.name) {
    return;
  }
  router.push({
    pathname: `/profile/${message.user.id}`,
    params: {
      userID: message.user.id,
      username: message.user.name,
    },
  });
};

export const CustomMessageAvatar = (props: MessageAvatarProps) => {
  const { message } = useMessageContext();
  if (!message) {
    return null;
  }
  return (
    <Pressable onPress={() => openProfile(message)}>
      <MessageAvatar {...props} />
    </Pressable>
  );
};

const CustomMessageReplyAvatar = (props: MessageAvatarProps) => {
  const { message } = useMessageContext();
  if (!message) {
    return null;
  }
  return (
    <Pressable
      onPress={() => openProfile(message.quoted_message as MessageType<any>)}
    >
      <MessageAvatar
        {...props}
        size={50}
        message={message.quoted_message as MessageType<any>}
      />
    </Pressable>
  );
};

export const CustomReplies = (props: ReplyProps) => {
  return <Reply {...props} MessageAvatar={CustomMessageReplyAvatar} />;
};
