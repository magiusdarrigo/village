import React from "react";
import { StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import Colors from "../../constants/Colors";
import ContactsScreen from "../(drawer)/contacts";

const Contacts = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ContactsScreen />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.tertiary,
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 24, // for top space
  },
});

export default Contacts;
