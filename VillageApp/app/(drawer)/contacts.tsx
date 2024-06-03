import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
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
import ProfileRow from "../../components/ProfileRow";
import { useQuery } from "@tanstack/react-query";

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
  const [numbers, setNumbers] = useState<string[]>([]);
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

  const contactsUseQuery = () => {
    return useQuery({
      queryKey: ["contacts"],
      queryFn: async () => {
        if (numbers.length === 0) {
          return Promise.resolve({ data: [] });
        }
        return getUsersFromPhoneNumbers(numbers);
      },
      enabled: !!numbers.length,
    });
  };

  const { data: profiles, isLoading, error, refetch } = contactsUseQuery();
  console.log("profiles", profiles);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const { data } = await Contacts.getContactsAsync();
      setContacts(data);
      const numbersData = getPhoneNumbersFromContacts(data);
      setNumbers(numbersData);
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
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            paddingVertical: 20,
          }}
        >
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
          ListHeaderComponent={
            <View style={styles.contactsTitleContainer}>
              <Text style={styles.contactsTitle}>Friends on Village</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          data={profiles?.data ?? []}
          keyExtractor={(item) => String(item.id)}
          stickyHeaderIndices={[0]}
          renderItem={({ item }) => (
            <ProfileRow
              profile={item}
              key={item.id}
              handleClose={() => {}}
              userIDOfProfile={user?.id}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  contactsTitleContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: "white",
  },
  contactsTitle: {
    fontSize: 24,
    fontWeight: "bold",
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
