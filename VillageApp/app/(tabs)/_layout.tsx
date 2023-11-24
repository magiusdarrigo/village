import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs, useSegments } from "expo-router";
import { Pressable, AppState } from "react-native";
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

// listener for when a user TAPS on a notification
notifee.onBackgroundEvent(async ({ detail, type }) => {
  if (type === EventType.PRESS) {
    await Promise.resolve();
  }
});

export default function TabLayout() {
  const {
    user,
    chatTabBadgeCount,
    updateChatTabBadgeCount,
    scrollToTop,
    channel,
    updateChannel,
    getStreamChatClient,
  } = useUser();
  const [appState, setAppState] = useState(AppState.currentState);
  const [activeTab, setActiveTab] = useState("home");
  const streamChatClient = getStreamChatClient();

  // badge count for when chat tab comes into foreground from background state
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          if (activeTab === "chat") {
            updateChatTabBadgeCount(0);
            return;
          }

          const count = await notifee.getBadgeCount();
          updateChatTabBadgeCount(count);
        }
        setAppState(nextAppState);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [appState]);

  // badge count for when chat tab comes into foreground from quit state
  useEffect(() => {
    const setChatTabBadgeCount = async () => {
      try {
        const count = await notifee.getBadgeCount();
        updateChatTabBadgeCount(count);
      } catch (error) {
        Sentry.Native.captureException(error);
      }
    };
    setChatTabBadgeCount();
  }, []);

  // correct badge count for chat tab when app is in foreground
  useEffect(() => {
    const { unsubscribe } = streamChatClient.on((event) => {
      if (event.type === "notification.message_new") {
        updateChatTabBadgeCount(event.total_unread_count);
      }
    });

    return () => {
      unsubscribe();
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
        listeners={{
          focus: (_) => {
            setActiveTab("home");
          },
          tabPress: (_) => {
            try {
              scrollToTop();
              channel?.stopWatching();
            } catch (error) {
              Sentry.Native.captureException(error);
            }
          },
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: user?.building?.address ?? "Chat",
          tabBarBadge: chatTabBadgeCount > 0 ? chatTabBadgeCount : undefined,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="comments" color={color} />
          ),
        }}
        listeners={{
          focus: (_) => {
            setActiveTab("chat");
          },
          tabPress: (_) => {
            try {
              channel?.watch();
              updateChatTabBadgeCount(0);
            } catch (error) {
              Sentry.Native.captureException(error);
            }
          },
        }}
      />
    </Tabs>
  );
}
