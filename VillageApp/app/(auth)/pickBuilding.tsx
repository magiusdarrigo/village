import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_MAPS_API_KEY } from "../../lib/api/config";
import { useTweetsApi } from "../../context/TweetContext";
import { useUser } from "../../context/UserContext";
import { router } from "expo-router";
import Colors from "../../constants/Colors";
import onboardingStyles from "../../lib/styles/onboarding";
import * as Sentry from "sentry-expo";

const PickBuilding = () => {
  const [address, setAddress] = useState("");
  const { getBuilding } = useTweetsApi();
  const { user } = useUser();

  const onSubmit = async () => {
    try {
      const building = await getBuilding(address);
      const neighborhoodName = building?.neighborhood?.name;
      if (user === null) {
        throw new Error("User is null");
      }
      if (neighborhoodName) {
        router.replace({
          pathname: "/showNeighborhood",
          params: {
            neighborhoodName,
            buildingID: building.id,
            neighborhoodID: building.neighborhood_id,
          },
        });
        return;
      }
      router.replace({
        pathname: "/pickNeighborhood",
        params: {
          buildingAddress: address,
        },
      });
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("We had an issue adding your building address. Try again.");
    }
  };

  const isButtonDisabled = address === "";

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text style={onboardingStyles.label}>Add your building address.</Text>
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <GooglePlacesAutocomplete
            placeholder="Enter Building Address"
            fetchDetails={true}
            GooglePlacesSearchQuery={{
              rankby: "distance",
            }}
            onPress={(data, details = null) => {
              setAddress(data.structured_formatting.main_text);
            }}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: "en",
              components: "country:us",
              types: "address",
              location: `${40.7128},${-74.006}`, // New York City latitude and longitude
              radius: "30000", // Limit search to 30km radius
            }}
            textInputProps={{
              autoFocus: true,
            }}
            styles={{
              textInput: {
                flex: 1,
                backgroundColor: "transparent",
                textAlignVertical: "top",
                color: "black",
                fontSize: 20,
              },
              description: {
                color: "black",
              },
              row: {
                backgroundColor: "transparent",
              },
              separator: {
                backgroundColor: "transparent",
              },
              poweredContainer: {
                flex: 1,
                backgroundColor: "transparent",
                maxHeight: 0,
                borderColor: "transparent",
              },
              powered: {
                maxHeight: 0,
              },
            }}
            nearbyPlacesAPI="GooglePlacesSearch"
            debounce={200}
          />
          <Pressable
            style={[
              onboardingStyles.button,
              isButtonDisabled ? onboardingStyles.buttonDisabled : {},
            ]}
            onPress={onSubmit}
            disabled={isButtonDisabled}
          >
            <Text style={onboardingStyles.buttonText}>Submit</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  textInputContainer: {
    padding: 0,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    marginBottom: 20,
    backgroundColor: Colors.light.tertiary,
  },
  textInput: {
    marginLeft: 0,
    marginRight: 0,
    height: 40,
    color: "black",
    fontSize: 16,
    backgroundColor: "transparent",
  },
  error: {
    marginVertical: 5,
    color: "red",
  },
  container: {
    backgroundColor: Colors.light.tertiary,
    flex: 1,
    paddingTop: 24, // for top space
    paddingHorizontal: 24,
  },
  input: {
    borderColor: "transparent", // no border
    borderWidth: 0,
    paddingTop: 10,
    fontSize: 20,
    color: "black",
  },
});

export default PickBuilding;
