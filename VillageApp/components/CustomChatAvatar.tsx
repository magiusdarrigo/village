import { Pressable, Image } from "react-native";
import { MessageAvatar, useMessageContext } from "stream-chat-expo";

const CustomChatAvatar = () => {
  const { message } = useMessageContext();

  const usedImage = message?.quoted_message
    ? message.quoted_message?.user?.image
    : message.user?.image;

  return (
    <Pressable onPress={() => console.log("fired")}>
      <MessageAvatar
        ImageComponent={(props) => (
          <Image {...props} source={{ uri: usedImage }} />
        )}
      />
    </Pressable>
  );
};

export default CustomChatAvatar;
