import { Pressable, Image } from "react-native";
import { MessageAvatar, useMessageContext } from "stream-chat-expo";
import { router } from "expo-router";

const CustomChatAvatar = () => {
  const { message } = useMessageContext();

  const usedImage = message?.quoted_message
    ? message.quoted_message?.user?.image
    : message.user?.image;

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
      <MessageAvatar
        ImageComponent={(props) => (
          <Image {...props} source={{ uri: usedImage }} />
        )}
      />
    </Pressable>
  );
};

export default CustomChatAvatar;
