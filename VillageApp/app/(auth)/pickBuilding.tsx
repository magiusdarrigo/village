import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_MAPS_API_KEY } from "../../lib/api/config";
import { useTweetsApi } from "../../lib/api/tweets";
import { useUser } from "../../context/UserContext";
import { router } from "expo-router";
import Colors from "../../constants/Colors";

const PickBuilding = () => {
  const [address, setAddress] = useState("");
  const { getBuilding } = useTweetsApi();
  const { user } = useUser();

  const onSubmit = async () => {
    try {
      console.log("address", address);
      const building = await getBuilding(address);
      console.log("building", building);
      const neighborhoodName = building?.neighborhood?.name;
      if (user === null) {
        throw new Error("User is null");
      }
      router.push({
        pathname: "/pickNeighborhood",
        params: {
          buildingAddress: address,
          neighborhoodName,
          buildingID: building?.id,
          neighborhoodID: building?.neighborhood?.id,
        },
      });
    } catch (error) {
      console.log(error);
      Alert.alert("We had an issue adding your building address. Try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.label}>Add your building address.</Text>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <GooglePlacesAutocomplete
          placeholder="Enter Building Address"
          fetchDetails={true}
          GooglePlacesSearchQuery={{
            rankby: "distance",
          }}
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            console.log(data, details);
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
          styles={{
            textInput: {
              backgroundColor: "transparent",
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
        <Pressable style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  label: {
    marginTop: 36, // space above the label
    fontSize: 24,
    marginBottom: 8, // space below the label
    color: "black",
    fontWeight: "bold",
    alignSelf: "flex-start", // align to top-left
  },
  input: {
    borderColor: "transparent", // no border
    borderWidth: 0,
    paddingTop: 10,
    fontSize: 20,
    color: "black",
  },
  button: {
    backgroundColor: "#050A12",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginTop: 5, // space above the button
    marginBottom: 50, // space below the button
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default PickBuilding;
