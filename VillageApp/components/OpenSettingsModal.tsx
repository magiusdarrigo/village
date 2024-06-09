import React from "react";
import {
  Modal,
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Pressable,
  Linking,
} from "react-native";
import onboardingStyles from "../lib/styles/onboarding";
import Colors from "../constants/Colors";

type OpenSettingsModalProps = {
  onClose: () => void;
  isVisible: boolean;
  modalTitle: string;
  modalDescription: string;
  buttonTitle: string;
};

const OpenSettingsModal = ({
  onClose,
  isVisible,
  modalTitle,
  modalDescription,
  buttonTitle,
}: OpenSettingsModalProps) => {
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
              <View style={{ flex: 1, justifyContent: "space-between" }}>
                <Text style={styles.modalDescription}>{modalDescription}</Text>
                <Pressable
                  style={[
                    onboardingStyles.button,
                    {
                      marginBottom: 15,
                      backgroundColor: Colors.light.openSettingsBlue,
                    },
                  ]}
                  onPress={() => Linking.openSettings()}
                >
                  <Text style={onboardingStyles.buttonText}>{buttonTitle}</Text>
                </Pressable>
              </View>
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

  modalDescription: {
    fontSize: 15,
    textAlign: "center",
    marginVertical: 15,
    color: Colors.light.switchFontColor,
    fontWeight: "600",
  },
  modalView: {
    width: "100%",
    height: Dimensions.get("window").height * 0.35,
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
  modalTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default OpenSettingsModal;
