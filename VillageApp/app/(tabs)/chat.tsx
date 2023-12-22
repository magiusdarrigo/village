import { ActivityIndicator, Alert, Platform } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import messaging from "@react-native-firebase/messaging";
import * as SecureStore from "expo-secure-store";
import { StreamChat } from "stream-chat";
import notifee from "@notifee/react-native";
import { isIOSSimulator } from "../../lib/helpers";
import * as Sentry from "sentry-expo";

import {
  OverlayProvider,
  Chat,
  Channel,
  MessageInput,
  MessageList,
} from "stream-chat-expo";

let areNotificationsEnabled = false;

const setTokenForUser = async (token: string) => {
  await SecureStore.setItemAsync("current_push_token", token);
  // store the token in the DB
};

// TODO: This should probably happen in the app's entrypoint file. Reason:
// https://stackoverflow.com/questions/66998305/warn-no-task-registered-for-key-reactnativefirebasemessagingheadlesstask-in-reac#:~:text=without%20mounting%20your
const setBackgroundMessageHandlerIfAndroid = async (
  userID: string,
  userChatToken: string | undefined,
  streamChatClient: StreamChat<any>
) => {
  if (Platform.OS !== "android") {
    return;
  }
  if (!userChatToken) {
    console.log("ERROR: userChatToken is undefined");
    return;
  }
  messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    try {
      streamChatClient._setToken(
        {
          id: userID,
        },
        userChatToken
      );
      // handle the message
      const message = await streamChatClient.getMessage(remoteMessage.data.id);

      // create the android channel to send the notification to
      const channelId = await notifee.createChannel({
        id: "chat-messages",
        name: "Chat Messages",
      });

      // display the notification
      const { stream, ...rest } = remoteMessage.data ?? {};
      const data = {
        ...rest,
        ...((stream as unknown as Record<string, string> | undefined) ?? {}),
      };
      await notifee.displayNotification({
        title: "New message from " + message.message.user?.name,
        body: message.message.text,
        data,
        android: {
          channelId,
          pressAction: {
            id: "default",
          },
        },
      });
    } catch (error) {
      Sentry.Native.captureException(error);
    }
  });
};

// Request Push Notification permission from device.
const requestPermission = async () => {
  if (isIOSSimulator()) {
    return;
  }
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  areNotificationsEnabled = enabled;
};

const ChatScreen = () => {
  const [isReady, setIsReady] = useState(false);
  const {
    user,
    getStreamChatClient,
    updateChatTabBadgeCount,
    channel,
    updateChannel,
  } = useUser();
  const streamChatClient = getStreamChatClient();
  const unsubscribeTokenRefreshListenerRef = useRef<() => void>();

  const setBackgroundMessageHandlerIfIOS = async () => {
    if (Platform.OS !== "ios") {
      return;
    }

    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
      const badgeCount = await notifee.getBadgeCount();
      updateChatTabBadgeCount(badgeCount);
    });
  };

  useEffect(() => {
    // Register FCM token with stream chat server.
    const registerPushToken = async () => {
      if (isIOSSimulator()) {
        return;
      }
      // unsubscribe any previous listener
      unsubscribeTokenRefreshListenerRef.current?.();
      const token = await messaging().getToken();
      console.log("FCM token: ", token);
      const push_provider = "firebase";
      const push_provider_name = "firebaseStreamAPINotificationConfig"; // name an alias for your push provider (optional)
      streamChatClient.setLocalDevice({
        id: token,
        push_provider,
        push_provider_name,
      });
      setTokenForUser(token);

      const removeOldToken = async () => {
        const oldToken = await SecureStore.getItemAsync("current_push_token");
        if (oldToken !== null) {
          await streamChatClient.removeDevice(oldToken);
        }
      };

      unsubscribeTokenRefreshListenerRef.current = messaging().onTokenRefresh(
        async (newToken) => {
          await Promise.all([
            removeOldToken(),
            streamChatClient.addDevice(
              newToken,
              push_provider,
              String(user?.id),
              push_provider_name
            ),
            setTokenForUser(newToken),
          ]);
        }
      );
    };

    const connectUserAndFetchChannel = async () => {
      try {
        // ask for push notification permission
        await requestPermission();
        if (areNotificationsEnabled) {
          // register push token
          await registerPushToken();
        }
        // set background message handler for android
        await setBackgroundMessageHandlerIfAndroid(
          String(user?.id),
          user?.chat_token,
          getStreamChatClient()
        );
        // set background message handler for ios
        // await setBackgroundMessageHandlerIfIOS();
        // connect user to chat
        await streamChatClient.connectUser(
          {
            id: String(user?.id),
            name: user?.username,
            image: user?.image,
          },
          user?.chat_token
        );
        // fetch channel
        const _id = String(user?.building_id);
        const channels = await streamChatClient.queryChannels({
          id: { $eq: _id },
        });
        const currentChannel = channels[0];
        updateChannel(currentChannel);
        // watch channel for new messages
        await currentChannel.watch();
        // ready to render
        setIsReady(true);
      } catch (error) {
        Sentry.Native.captureException(error);
        Alert.alert(
          "We had an issue adding you to your building chat. Try again."
        );
      }
    };

    connectUserAndFetchChannel();

    return () => {
      if (streamChatClient.userID) {
        streamChatClient.disconnectUser();
        unsubscribeTokenRefreshListenerRef.current?.();
      }
    };
  }, []);

  if (!channel) {
    return <ActivityIndicator />;
  }

  if (!isReady) {
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
