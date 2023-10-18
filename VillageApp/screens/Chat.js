import React, { useState } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'

export default function Chat() {
  const [messages, setMessages] = useState([])

  function handleSend(newMessages) {
    setMessages(GiftedChat.append(messages, newMessages))
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={handleSend}
      user={{
        _id: 1,
        name: 'John Doe',
        avatar: 'https://placeimg.com/140/140/any',
      }}
    />
  )
}
