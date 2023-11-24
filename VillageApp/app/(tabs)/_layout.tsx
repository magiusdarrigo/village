import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";
import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import Colors from "../../constants/Colors";
import notifee, { EventType } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import * as Sentry from "sentry-expo";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

notifee.onBackgroundEvent(async ({ detail, type }) => {
  if (type === EventType.PRESS) {
    if (detail.notification) {
      console.log(
        "[Android] When the application is running but in the background. Notification: ",
        detail.notification
      );
    }
    await Promise.resolve();
  }
});

export default function TabLayout() {
  const { user, getStreamChatClient } = useUser();
  const [chatTabBadgeCount, setChatTabBadgeCount] = useState<
    string | undefined
  >(undefined);

  const handleUnreadChatCount = (event: any) => {
    if (event?.unread_count) {
      setChatTabBadgeCount(event.unread_count);
    }
  };

  // set up listener for unread chat count changes
  useEffect(() => {
    const streamChatUser = getStreamChatClient()?.user;
    if (streamChatUser) {
      streamChatUser.on("notification.message_new", handleUnreadChatCount);
    }
    return () => {
      if (streamChatUser) {
        streamChatUser.off("notification.message_new", handleUnreadChatCount);
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribeOnNotificationOpen = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        if (remoteMessage?.notification) {
          Sentry.Native.captureMessage(
            "[iOS] When the application is running, but in the background. Notification: " +
              JSON.stringify(remoteMessage?.notification)
          );
        }
        // set the chat tab badge count
        if (remoteMessage?.notification?.ios?.badge) {
          // setChatTabBadgeCount(remoteMessage.notification.ios.badge);
        }
      }
    );

    notifee.getInitialNotification().then((initialNotification) => {
      if (initialNotification?.notification) {
        console.log(
          "[Android] When the application is opened from a quit state. Notification: ",
          initialNotification
        );
      }
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage?.notification) {
          Sentry.Native.captureMessage(
            "[iOS] When the application is opened from a quit state. Notification: " +
              JSON.stringify(remoteMessage?.notification)
          );
        }
        // set the chat tab badge count
        if (remoteMessage?.notification?.ios?.badge) {
          // setChatTabBadgeCount(remoteMessage.notification.ios.badge);
        }
      });

    return () => {
      unsubscribeOnNotificationOpen();
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: user?.neighborhood?.name ?? "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Link
              // TODO: I notice that logging out will keep the home page in the history stack. If I
              // add the replace={true} prop, then the home page will not be in the history stack when I log out,
              // but then I can't go back to the home page when I'm logged in.
              href={{
                pathname: `/profile/you`,
                params: {
                  userID: user?.id ?? -1,
                  username: user?.username ?? "",
                  image: user?.image ?? "",
                },
              }}
              asChild
            >
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="user"
                    size={25}
                    color={Colors.light.text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: user?.building?.address ?? "Chat",
          tabBarBadge: chatTabBadgeCount,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="comments" color={color} />
          ),
        }}
        listeners={{
          tabPress: (_) => {
            try {
              // setChatTabBadgeCount(undefined);
              notifee.setBadgeCount(0);
            } catch (error) {
              Sentry.Native.captureException(error);
            }
          },
        }}
      />
    </Tabs>
  );
}
