import { StreamChat } from "stream-chat";

const streamChatClient = StreamChat.getInstance(
  process.env.STREAM_CHAT_API_KEY ?? "",
  process.env.STREAM_CHAT_API_SECRET
);

export default streamChatClient;
