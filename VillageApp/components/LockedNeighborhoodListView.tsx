import { View } from "react-native";
import { DynaPuffText } from "./StyledText";
import postStyles from "../lib/styles/post";

type LockedNeighborhoodListViewProps = {
  membersCount: number;
};

const renderLockedNeighborhoodListView = ({
  membersCount,
}: LockedNeighborhoodListViewProps) => {
  return (
    <View style={postStyles.emptyPostsContainer}>
      <DynaPuffText style={postStyles.emptyPostsContainerText}>
        {"this neighborhood is locked 🔒"}
      </DynaPuffText>
      <DynaPuffText
        style={[
          postStyles.emptyPostsContainerText,
          { fontSize: 20, marginTop: 10 },
        ]}
      >
        {"we'll text you once it opens."}
      </DynaPuffText>
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <DynaPuffText
          style={[
            postStyles.emptyPostsContainerText,
            { fontSize: 20, paddingHorizontal: 3, color: "black" },
          ]}
        >
          {999 - membersCount}
        </DynaPuffText>
        <DynaPuffText
          style={[
            postStyles.emptyPostsContainerText,
            { fontSize: 20, paddingHorizontal: 3 },
          ]}
        >
          {"more members needed"}
        </DynaPuffText>
      </View>
    </View>
  );
};

export default renderLockedNeighborhoodListView;
