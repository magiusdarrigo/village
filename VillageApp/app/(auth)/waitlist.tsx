import React, { useEffect } from "react";
import { Text, View, StyleSheet, Linking } from "react-native";
import Colors from "../../constants/Colors";
import { SplashScreen } from "expo-router";

const Waitlist = () => {
  const handleContactSupport = () => {
    Linking.openURL("mailto:magiusdarrigo@gmail.com");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingBottom: 256,
        }}
      >
        <Text style={styles.waitlistTitle}>
          you've been added to the waitlist 🎉
        </Text>
        <Text style={styles.contactSupportLabel}>
          we'll text you once we've added your neighborhood to Village.{" "}
          <Text
            style={styles.contactSupportLink}
            onPress={handleContactSupport}
          >
            contact support
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contactSupportLabel: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "500",
    color: "black", // standard text color
  },
  contactSupportLink: {
    color: "black",
    fontWeight: "bold",
  },
  waitlistTitle: {
    fontSize: 48,
    color: "black",
    fontWeight: "bold",
    alignSelf: "center",
    textAlign: "center",
  },
  container: {
    backgroundColor: Colors.light.tertiary,
    flex: 1,
    paddingTop: 24, // for top space
    paddingHorizontal: 12,
  },
});

export default Waitlist;
