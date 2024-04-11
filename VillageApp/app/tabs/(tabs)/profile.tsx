import { ActivityIndicator } from "react-native";
import Profile from "../../../components/Profile";
import { useUser } from "../../../context/UserContext";

const YourProfileScreen = () => {
  const { user } = useUser();

  if (!user) {
    return <ActivityIndicator />;
  }

  return <Profile user={user} />;
};

export default YourProfileScreen;
