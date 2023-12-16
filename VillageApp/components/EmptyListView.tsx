import { View } from "react-native";
import { DynaPuffText } from "./StyledText";
import postStyles from "../lib/styles/post";

const renderEmptyListComponentForPosts = (text: string) => (
  <View style={postStyles.emptyPostsContainer}>
    <DynaPuffText style={postStyles.emptyPostsContainerText}>
      {text}
    </DynaPuffText>
  </View>
);

export default renderEmptyListComponentForPosts;
