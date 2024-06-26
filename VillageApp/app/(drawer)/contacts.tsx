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
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";
import * as Sentry from "sentry-expo";
import { useTweetsApi } from "../../context/TweetContext";
import { useUser } from "../../context/UserContext";
import ProfileRow from "../../components/ProfileRow";
import { ProfileRowType } from "../../types/index";
import { useQuery } from "@tanstack/react-query";
import LoadingScreen from "../../components/LoadingScreen";
import OpenSettingsModal from "../../components/OpenSettingsModal";
import {
  getDDBReadableNumber,
  getDeviceType,
  DeviceType,
} from "../../lib/helpers";
import { router, useSegments } from "expo-router";

const deviceType = getDeviceType();
const smallDevice = deviceType === DeviceType.iPhoneSmall;

const getPhoneNumbersFromContacts = (contacts: Contacts.Contact[]) => {
  const phoneNumbers: string[] = [];
  for (const contact of contacts) {
    if (contact.phoneNumbers) {
      for (const phoneNumber of contact.phoneNumbers) {
        if (phoneNumber.number) {
          phoneNumbers.push(getDDBReadableNumber(phoneNumber.number));
        }
      }
    }
  }
  return phoneNumbers;
};

const ContactsScreen = () => {
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [permissions, setPermissions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { getUsersFromPhoneNumbers } = useTweetsApi();
  const { user } = useUser();
  const segments = useSegments();
  if (!user) {
    return null;
  }

  const isOnboarding = segments[0] === "(auth)";

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
    } else if (isOnboarding) {
      router.replace("/tabs");
    } else {
      setModalVisible(true);
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

  const { data: profiles, fetchStatus } = contactsUseQuery();

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

  const isButtonDisabled = loading || permissions;

  // we need to create a list of profiles from phone numbers first and then append the rest of the contacts
  let formattedProfiles = profiles?.data ?? [];
  // remove myself from the list
  formattedProfiles = formattedProfiles.filter(
    (profile: any) => profile.username !== user.username
  );

  const profilePhoneNumbersSet = new Set(
    formattedProfiles.map((profile: any) => profile.phone_number)
  );
  const formattedContacts = contacts.reduce(
    (accumulator: any, current: any) => {
      if (!current.phoneNumbers?.[0]?.number || !current.name) {
        return accumulator;
      }
      console.log("number: ", current.phoneNumbers?.[0]?.number);
      const formattedNumber = getDDBReadableNumber(
        current.phoneNumbers?.[0].number
      );
      if (profilePhoneNumbersSet.has(formattedNumber)) {
        return accumulator;
      }
      const prof = {
        created_at: "NA",
        follower_user_id: "NA",
        id: current.id,
        neighborhood_name: formattedNumber ?? "",
        profile_image: "",
        username: current.name,
        followed_by_user: false,
      } as ProfileRowType;
      accumulator.push(prof);
      return accumulator;
    },
    []
  );
  const profilesCount = formattedProfiles.length;
  // sort them in alphabetical order by username
  formattedProfiles.sort((a: any, b: any) => {
    if (a.username < b.username) {
      return -1;
    }
    if (a.username > b.username) {
      return 1;
    }
    return 0;
  });
  formattedContacts.sort((a: any, b: any) => {
    if (a.username < b.username) {
      return -1;
    }
    if (a.username > b.username) {
      return 1;
    }
    return 0;
  });
  const allProfiles = [...formattedProfiles, ...formattedContacts];

  if (fetchStatus === "fetching") {
    return <LoadingScreen />;
  }

  const onDone = () => {
    router.replace("/tabs");
  };

  return (
    <View
      style={[
        styles.container,
        isOnboarding
          ? { paddingHorizontal: 10 }
          : { backgroundColor: "white", paddingHorizontal: 10 },
      ]}
    >
      {!permissions && (
        <View
          style={[
            {
              flex: 1,
              justifyContent: "space-between",
            },
            isOnboarding ? {} : { paddingTop: 20 },
          ]}
        >
          <Text
            style={[
              styles.infoText,
              isOnboarding
                ? {
                    textAlign: "left",
                    color: "black",
                    fontWeight: "bold",
                    fontSize: 36,
                    paddingHorizontal: 14,
                  }
                : { lineHeight: 22 },
              isOnboarding
                ? smallDevice
                  ? { marginTop: 12 }
                  : { marginTop: 36 }
                : {},
            ]}
          >
            sync contacts to find friends on Village or invite them if they're
            in nyc 🗽
          </Text>
          <Pressable
            style={[
              onboardingStyles.button,
              isButtonDisabled ? onboardingStyles.buttonDisabled : {},
              smallDevice ? { marginBottom: 18 } : {},
            ]}
            onPress={askForPermissions}
            disabled={isButtonDisabled}
          >
            <Text style={onboardingStyles.buttonText}>sync contacts</Text>
          </Pressable>
        </View>
      )}
      {permissions && (
        <FlatList
          ListHeaderComponent={() => {
            return (
              <View
                style={[
                  styles.contactsTitleContainer,
                  profilesCount == 0 ? { height: 0 } : {},
                  isOnboarding ? {} : { backgroundColor: "white" },
                ]}
              >
                <Text style={styles.contactsTitle}>friends on Village</Text>
              </View>
            );
          }}
          showsVerticalScrollIndicator={true}
          data={allProfiles}
          style={isOnboarding ? { marginTop: 24 } : {}}
          keyExtractor={(item) => String(item.id)}
          // stickyHeaderIndices={[0]}
          renderItem={({ item, index }) => (
            <>
              {index == profilesCount && (
                <View
                  style={[
                    styles.contactsTitleContainer,
                    isOnboarding ? {} : { backgroundColor: "white" },
                    profilesCount === 0 ? { paddingTop: 0 } : {},
                  ]}
                >
                  <Text style={styles.contactsTitle}>invite friends</Text>
                </View>
              )}
              <ProfileRow
                profile={item}
                key={item.id}
                handleClose={() => {}}
                userIDOfProfile={user?.id}
                isInviteRow={index >= profilesCount}
                isOnboarding={isOnboarding}
              />
            </>
          )}
        />
      )}
      {permissions && isOnboarding && (
        <Pressable
          style={[
            onboardingStyles.button,
            smallDevice ? { marginBottom: 18 } : {},
          ]}
          onPress={onDone}
        >
          <Text style={onboardingStyles.buttonText}>done</Text>
        </Pressable>
      )}
      <OpenSettingsModal
        isVisible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
        modalTitle="Contacts Share is off"
        modalDescription="Enable contacts on Village - NYC in settings and then try again."
        buttonTitle="Go to Settings"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contactsTitleContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
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
