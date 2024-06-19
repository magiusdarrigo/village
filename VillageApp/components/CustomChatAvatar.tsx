import { Pressable } from "react-native";
import {
  MessageAvatar,
  MessageAvatarProps,
  MessageType,
  Reply,
  ReplyProps,
  useMessageContext,
} from "stream-chat-expo";
import { router } from "expo-router";

export const CustomMessageAvatar = (props: MessageAvatarProps) => {
  const { message } = useMessageContext();
  if (!message) {
    return null;
  }
  const openProfile = () => {
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
  return (
    <Pressable onPress={openProfile}>
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
    <Pressable onPress={() => console.log("Quoted Avatar")}>
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
