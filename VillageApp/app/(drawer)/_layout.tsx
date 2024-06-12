import { withLayoutContext, router } from "expo-router";
import {
  DrawerContentScrollView,
  DrawerItemList,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import { ActivityIndicator, Pressable } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { View } from "../../components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { DynaPuffText } from "../../components/StyledText";

const DrawerNavigator = createDrawerNavigator().Navigator;
const Drawer = withLayoutContext(DrawerNavigator);

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: Colors.light.tertiary }}
    >
      <View>
        <View
          style={{
            backgroundColor: Colors.light.tertiary,
            width: "100%",
            height: 85,
            display: "flex",
            justifyContent: "center",
            paddingLeft: 18,
            paddingBottom: 5,
          }}
        >
          <DynaPuffText style={{ fontSize: 38, color: "black" }}>
            Village
          </DynaPuffText>
        </View>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { authToken } = useAuth();

  if (!authToken) {
    return <ActivityIndicator />;
  }

  return (
    <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="tabs/(tabs)"
        options={{
          headerShown: false,
          headerBackTitleVisible: false,
          headerTintColor: "black",
          title: "Home",
          drawerActiveBackgroundColor: "rgba(0, 0, 0, 0.04)",
          drawerInactiveBackgroundColor: "transparent",
          drawerLabelStyle: { color: "black", fontSize: 18 },
          drawerItemStyle: { marginTop: -10 },
        }}
      />
      <Drawer.Screen
        name="neighborhoods"
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerTintColor: "black",
          title: "Neighborhoods",
          drawerActiveBackgroundColor: "rgba(0, 0, 0, 0.04)",
          drawerInactiveBackgroundColor: "transparent",
          drawerLabelStyle: { color: "black", fontSize: 18 },
          drawerItemStyle: { marginTop: -10 },
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              {({ pressed }) => (
                <Ionicons
                  name="chevron-back-outline"
                  size={28}
                  color={Colors.light.text}
                  style={{ opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />
      <Drawer.Screen
        name="contacts"
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerTintColor: "black",
          title: "Contacts",
          drawerActiveBackgroundColor: "rgba(0, 0, 0, 0.04)",
          drawerInactiveBackgroundColor: "transparent",
          drawerLabelStyle: { color: "black", fontSize: 18 },
          drawerItemStyle: { marginTop: -10 },
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              {({ pressed }) => (
                <Ionicons
                  name="chevron-back-outline"
                  size={28}
                  color={Colors.light.text}
                  style={{ opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />
    </Drawer>
  );
}
