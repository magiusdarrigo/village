import React, { useRef } from "react";
import {
  Modal,
  Text,
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { ProfileRowType } from "../types";
import EmptyListView from "./EmptyListView";
import ProfileRow from "./ProfileRow";

type ProfilesListModalProps = {
  isVisible: boolean;
  profiles: ProfileRowType[];
  onClose: () => void;
  modalTitle: string;
  handleLoadMoreProfiles: () => void;
  isFetchingNextProfilesPage: boolean;
};

const ProfilesListModal = ({
  isVisible,
  profiles,
  onClose,
  modalTitle,
  handleLoadMoreProfiles,
  isFetchingNextProfilesPage,
}: ProfilesListModalProps) => {
  const flatListRef = useRef<FlatList>(null);

  const renderEmptyListComponent = () => {
    if (modalTitle === "Followers") {
      return (
        <View style={styles.emptyProfilesView}>
          {EmptyListView("No followers yet.")}
        </View>
      );
    } else {
      return EmptyListView("Not following anyone yet.");
    }
  };

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
              <FlatList
                style={styles.flatList}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                ref={flatListRef}
                data={profiles}
                renderItem={({ item }) => (
                  <ProfileRow
                    profile={item}
                    key={item.id}
                    handleClose={onClose}
                  />
                )}
                onEndReached={handleLoadMoreProfiles}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  isFetchingNextProfilesPage
                    ? () => <ActivityIndicator size="small" />
                    : null
                }
                ListEmptyComponent={renderEmptyListComponent}
              />
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
  flatList: {
    width: "100%",
    marginTop: 10,
  },
  emptyProfilesView: {
    minHeight: "90%",
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
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default ProfilesListModal;
