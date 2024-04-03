import { useContext } from "react";
import { MessageList, KeyboardContext } from "stream-chat-expo";

const CustomMessageList = () => {
  const { dismissKeyboard } = useContext(KeyboardContext);
  return <MessageList onListScroll={dismissKeyboard} />;
};

export default CustomMessageList;
