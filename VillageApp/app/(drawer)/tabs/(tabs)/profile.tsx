import { ActivityIndicator, Alert } from "react-native";
import Profile from "../../../../components/Profile";
import { useUser } from "../../../../context/UserContext";
import { useTweetsApi } from "../../../../context/TweetContext";
import * as Sentry from "sentry-expo";

const YourProfileScreen = () => {
  const { user, updateUser } = useUser();
  const { getCurrentUser } = useTweetsApi();

  const handleRefetchUser = async () => {
    try {
      const updatedUser = await getCurrentUser();
      updateUser(updatedUser);
    } catch (error) {
      Sentry.Native.captureException(error);
      Alert.alert("we couldn't update your profile. try again.");
    }
  };

  if (!user) {
    return <ActivityIndicator />;
  }

  console.log("hydrated user", user);

  return <Profile user={user} refetchProfile={handleRefetchUser} />;
};

export default YourProfileScreen;
