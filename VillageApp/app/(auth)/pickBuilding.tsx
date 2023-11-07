import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_MAPS_API_KEY } from "../../lib/api/config";
import { useTweetsApi } from "../../lib/api/tweets";
import { useUser } from "../../context/UserContext";
import { router } from "expo-router";

const PickBuilding = () => {
  const [address, setAddress] = useState("");
  const { getBuilding } = useTweetsApi();
  const { user, updateUser } = useUser();

  const onSubmit = async () => {
    try {
      console.log(address);
      const building = await getBuilding(address);
      const neighborhoodName = building?.neighborhood?.name;
      if (user === null) {
        throw new Error("User is null");
      }
      if (building?.neighborhood?.id) {
        updateUser({
          ...user,
          building_id: building.id,
          neighborhood_id: building.neighborhood.id,
        });
      }
      router.push({
        pathname: "/pickNeighborhood",
        params: { buildingAddress: address, neighborhoodName },
      });
    } catch (error) {
      console.log(error);
      Alert.alert("We had an issue adding your building address. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add your building address</Text>
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
          textInputContainer: styles.textInputContainer,
          textInput: styles.textInput,
        }}
        nearbyPlacesAPI="GooglePlacesSearch"
        debounce={200}
      />
      <Pressable style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
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
  },
  textInput: {
    marginLeft: 0,
    marginRight: 0,
    height: 38,
    color: "#5d5d5d",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#050A12",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginVertical: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default PickBuilding;
