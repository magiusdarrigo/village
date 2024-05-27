import { withLayoutContext, router } from "expo-router";
import {
  DrawerContentScrollView,
  DrawerItemList,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import { ActivityIndicator, Image, Pressable } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { View } from "../../components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";

const DrawerNavigator = createDrawerNavigator().Navigator;
const Drawer = withLayoutContext(DrawerNavigator);

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <View>
        <Image
          source={require("../../assets/images/transparent-icon-crop.png")}
          style={{ width: 150, height: 100 }}
          resizeMode="contain"
        />
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
          drawerLabelStyle: { color: "black" },
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
          drawerLabelStyle: { color: "black" },
          drawerItemStyle: { marginTop: -10, marginBottom: 25 },
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
