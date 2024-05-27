import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Octicons, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable, AppState, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { useUser } from "../../../context/UserContext";
import { useAuth } from "../../../context/AuthContext";
import Colors from "../../../constants/Colors";
import notifee, { EventType } from "@notifee/react-native";
import * as Sentry from "sentry-expo";
import { useActionSheet } from "@expo/react-native-action-sheet";
import {
  DeviceType,
  getDeviceType,
  handlePressButtonAsync,
} from "../../../lib/helpers";
import { useTweetsApi } from "../../../context/TweetContext";
import { Linking } from "react-native";

const TERMS_OF_SERVICE_URL =
  "https://villagenyc.notion.site/Terms-of-Use-Sale-for-Village-1da7d1897d1e485e8f80125a3a3be087?pvs=4";
const PRIVACY_POLICY_URL =
  "https://villagenyc.notion.site/Privacy-Policy-for-Village-845fb113171045c3bdd26c828e8ccf26?pvs=4";
const REPORT_A_BUG_URL =
  "https://villagenyc.notion.site/Report-a-Bug-for-Village-a46e44e552cf4234b5a6fc9f5294559b?pvs=4";

const getVerticalOffset = () => {
  switch (getDeviceType()) {
    case DeviceType.iPhoneSmall:
      return {
        fontAwesome: {
          marginBottom: 0,
          marginTop: 2,
        },
        octicon: {
          marginBottom: -3,
          marginTop: 2,
        },
        tabBarLabelStyle: { marginBottom: 5 },
      };
    default:
      return {
        fontAwesome: {
          marginBottom: -3,
          marginTop: 2,
        },
        octicon: {
          marginBottom: -5,
          marginTop: 2,
        },
        tabBarLabelStyle: {},
      };
  }
};

const tabVerticalOffset = getVerticalOffset();

function TabBarIconFontAwesome(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return (
    <FontAwesome size={24} style={tabVerticalOffset.fontAwesome} {...props} />
  );
}

function TabBarIconOcticons(props: {
  name: React.ComponentProps<typeof Octicons>["name"];
  color: string;
}) {
  return <Octicons size={22} style={tabVerticalOffset.octicon} {...props} />;
}

// listener for when a user TAPS on a notification
notifee.onBackgroundEvent(async ({ type }) => {
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
    getStreamChatClient,
    activeTab,
    updateActiveTab,
  } = useUser();
  const { removeAuthToken } = useAuth();
  const { addBuildingChangeRequest, accountDeletionRequest } = useTweetsApi();
  const [appState, setAppState] = useState(AppState.currentState);
  const streamChatClient = getStreamChatClient();
  const { showActionSheetWithOptions } = useActionSheet();

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

  const handleBuildingChangeRequest = async (address: string) => {
    try {
      await addBuildingChangeRequest(address);
      Alert.alert(
        "Building Request Submitted",
        "Your request has been submitted. We will notify you when it's been approved."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "There was an error submitting your request. Please try again."
      );
      Sentry.Native.captureException(error);
    }
  };

  const onSettingsPress = () => {
    const options = [
      "Request Building Change",
      "Terms of Service",
      "Privacy Policy",
      "Report A Bug",
      "Contact Us",
      "Delete Account",
      "Log Out",
      "Cancel",
    ];
    const requestBuildingChangeIndex = 0;
    const termsOfServiceIndex = 1;
    const privacyPolicyIndex = 2;
    const reportABugIndex = 3;
    const contactUsIndex = 4;
    const deleteAccountIndex = 5;
    const logOutIndex = 6;
    const destructiveButtonIndexes = [deleteAccountIndex, logOutIndex];
    const cancelButtonIndex = 7;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: destructiveButtonIndexes,
      },
      (selectedIndex: any) => {
        switch (selectedIndex) {
          case requestBuildingChangeIndex:
            Alert.prompt(
              "Building Change Request",
              "What's the address of the building?",
              (text) => handleBuildingChangeRequest(text),
              "plain-text"
            );
            break;
          case termsOfServiceIndex:
            handlePressButtonAsync(TERMS_OF_SERVICE_URL);
            break;
          case privacyPolicyIndex:
            handlePressButtonAsync(PRIVACY_POLICY_URL);
            break;
          case reportABugIndex:
            handlePressButtonAsync(REPORT_A_BUG_URL);
            break;
          case contactUsIndex:
            Linking.openURL("mailto:magiusdarrigo@gmail.com");
            break;
          case deleteAccountIndex:
            Alert.alert(
              "Are you sure you want to delete your account?",
              "All related data will be permanently deleted within 48 hours. This action cannot be undone.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Delete Account",
                  onPress: async () => {
                    try {
                      // delete account request submitted
                      await accountDeletionRequest();
                      streamChatClient.disconnectUser();
                      removeAuthToken();
                    } catch (error) {
                      Sentry.Native.captureException(error);
                      Alert.alert(
                        "Error",
                        "There was an error deleting your account. Please try again."
                      );
                    }
                  },
                },
              ]
            );
            break;
          case logOutIndex:
            Alert.alert("Are you sure you want to log out?", "", [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Log out",
                onPress: async () => {
                  streamChatClient.disconnectUser();
                  removeAuthToken();
                },
              },
            ]);
            break;
          case cancelButtonIndex:
            break;
        }
      }
    );
  };

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
          title: "Home",
          headerTitle: user?.neighborhood?.name || "Home",
          tabBarLabelStyle: tabVerticalOffset.tabBarLabelStyle,
          tabBarIcon: ({ color }) => (
            <TabBarIconFontAwesome name="home" color={color} />
          ),
          headerLeft: () => (
            <Pressable onPress={() => {}}>
              {({ pressed }) => (
                <Ionicons
                  name="menu"
                  size={28}
                  color={Colors.light.text}
                  style={{ marginLeft: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => {}}>
              {({ pressed }) => (
                <Ionicons
                  name="search"
                  size={25}
                  color={Colors.light.text}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
        listeners={{
          focus: (_) => {
            updateActiveTab("home");
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
          title: "Building",
          headerTitle: user?.building?.address || "Building",
          tabBarLabelStyle: tabVerticalOffset.tabBarLabelStyle,
          tabBarBadge: chatTabBadgeCount > 0 ? chatTabBadgeCount : undefined,
          tabBarIcon: ({ color }) => (
            <TabBarIconFontAwesome name="comments" color={color} />
          ),
        }}
        listeners={{
          focus: (_) => {
            updateActiveTab("chat");
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
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Activity",
          tabBarLabelStyle: tabVerticalOffset.tabBarLabelStyle,
          tabBarIcon: ({ color }) => (
            <TabBarIconOcticons name="bell-fill" color={color} />
          ),
        }}
        listeners={{
          focus: (_) => {
            updateActiveTab("activity");
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "You",
          tabBarLabelStyle: tabVerticalOffset.tabBarLabelStyle,
          tabBarIcon: ({ color }) => (
            <TabBarIconFontAwesome name="user" color={color} />
          ),
          headerRight: () => (
            <Pressable onPress={onSettingsPress}>
              {({ pressed }) => (
                <FontAwesome
                  name="gear"
                  size={25}
                  color={Colors.light.text}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
        listeners={{
          focus: (_) => {
            updateActiveTab("profile");
          },
        }}
      />
    </Tabs>
  );
}
