import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable, Platform } from "react-native";
import React, { useEffect } from "react";
import { useUser } from "../../context/UserContext";
import Colors from "../../constants/Colors";
import notifee, { EventType } from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

notifee.onBackgroundEvent(async ({ detail, type }) => {
  if (type === EventType.PRESS) {
    console.log(
      "[Android] When the application is running but in the background. Notification: ",
      detail.notification
    );
    await Promise.resolve();
  }
});

export default function TabLayout() {
  const { user } = useUser();

  useEffect(() => {
    const unsubscribeOnNotificationOpen = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        console.log(
          "[iOS] When the application is running, but in the background. Notification: ",
          remoteMessage
        );
      }
    );

    notifee.getInitialNotification().then((initialNotification) => {
      console.log(
        "[Android] When the application is opened from a quit state. Notification: ",
        initialNotification
      );
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        console.log(
          "[iOS] When the application is opened from a quit state. Notification: ",
          remoteMessage
        );
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
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="comments" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
