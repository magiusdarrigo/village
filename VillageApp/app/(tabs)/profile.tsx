import { ActivityIndicator } from "react-native";
import ModalScreen from "../modal";
import { useUser } from "../../context/UserContext";

const ProfileScreen = () => {
  const { user } = useUser();

  if (!user) {
    return <ActivityIndicator />;
  }

  return <ModalScreen user={user} />;
};

export default ProfileScreen;
