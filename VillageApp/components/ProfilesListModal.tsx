import React from "react";
import {
  Modal,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";

type ProfilesListModalProps = {
  isVisible: boolean;
  profiles: string[];
  onClose: () => void;
  modalTitle: string;
};

const ProfilesListModal = ({
  isVisible,
  profiles,
  onClose,
  modalTitle,
}: ProfilesListModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback>
            <View style={styles.modalView}>
              <View>
                <Text style={styles.modalTitle}>{modalTitle}</Text>
              </View>
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {profiles.map((profile, index) => (
                  <View key={index} style={styles.profileRow}>
                    <Text>{profile}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalView: {
    width: "100%",
    height: Dimensions.get("window").height * 0.75,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  profileRow: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default ProfilesListModal;
