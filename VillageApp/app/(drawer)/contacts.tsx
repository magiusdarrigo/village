import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import * as Contacts from "expo-contacts";
import * as SMS from "expo-sms";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";
import * as Sentry from "sentry-expo";
import { useTweetsApi } from "../../context/TweetContext";
import { useUser } from "../../context/UserContext";
import { ProfileRowType } from "../../types";
import ProfileRow from "../../components/ProfileRow";

type ContactProps = {};

const getPhoneNumbersFromContacts = (contacts: Contacts.Contact[]) => {
  const phoneNumbers: string[] = [];
  for (const contact of contacts) {
    if (contact.phoneNumbers) {
      for (const phoneNumber of contact.phoneNumbers) {
        if (phoneNumber.number) {
          phoneNumbers.push(phoneNumber.number);
        }
      }
    }
  }
  return phoneNumbers;
};

const ContactsScreen = (props: ContactProps) => {
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [profiles, setProfiles] = useState<ProfileRowType[]>([]);
  const [permissions, setPermissions] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getUsersFromPhoneNumbers } = useTweetsApi();
  const { user } = useUser();
  if (!user) {
    return null;
  }

  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Contacts.getPermissionsAsync();
      console.log("permissions status", status);
      if (status === "granted") {
        setPermissions(true);
        loadContacts();
      }
    };
    checkPermissions();
  }, []);

  const askForPermissions = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      setPermissions(true);
      loadContacts();
    } else {
      alert("Permission to access contacts is required!");
    }
  };

  const loadContacts = async () => {
    try {
      setLoading(true);
      const { data } = await Contacts.getContactsAsync();
      setContacts(data);
      const numbers = getPhoneNumbersFromContacts(data);
      console.log("numbers", numbers);
      // fetch all contacts that are village users
      const profilesData = await getUsersFromPhoneNumbers(numbers);
      const profiles = profilesData?.data ?? [];
      console.log("profiles", profiles);
      setProfiles(profiles);
    } catch (error) {
      Alert.alert("Error", "Failed to load contacts");
      Sentry.Native.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (phoneNumber: string) => {
    const { result } = await SMS.sendSMSAsync(
      [phoneNumber],
      "Add me on Village."
    );
    console.log(result);
  };
  const isButtonDisabled = loading || permissions;

  return (
    <View style={styles.container}>
      {!permissions && (
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <Text style={styles.infoText}>
            Sync contacts to find friends on Village or invite them if they're
            in NYC 🗽
          </Text>
          <Pressable
            style={[
              onboardingStyles.button,
              isButtonDisabled ? onboardingStyles.buttonDisabled : {},
              { marginBottom: 15 },
            ]}
            onPress={askForPermissions}
            disabled={isButtonDisabled}
          >
            <Text style={onboardingStyles.buttonText}>Sync Contacts</Text>
          </Pressable>
        </View>
      )}
      {permissions && (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={profiles}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ProfileRow
              profile={item}
              key={item.id}
              handleClose={() => {}}
              userIDOfProfile={user?.id}
            />
          )}
          ListFooterComponent={() => (
            <View>
              {contacts.map((item, index) => (
                <View key={index} style={styles.contactRow}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  {item.phoneNumbers && (
                    <TouchableOpacity
                      style={styles.inviteButton}
                      onPress={() => handleInvite(item.phoneNumbers[0].number)}
                    >
                      <Text style={styles.buttonText}>Invite</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  infoText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.switchFontColor,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  contactName: {
    fontSize: 16,
  },
  followButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 5,
    padding: 10,
  },
  inviteButton: {
    backgroundColor: "green",
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ContactsScreen;
