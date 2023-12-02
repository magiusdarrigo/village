import React, { useRef, useState } from "react";
import { StyleSheet, Text, View, TouchableWithoutFeedback } from "react-native";
import * as Animatable from "react-native-animatable";
import Colors from "../constants/Colors";

let componentWidth = 100;

type FeedSwitchProps = {
  isHot: boolean;
  setIsHot: React.Dispatch<React.SetStateAction<boolean>>;
};

const FeedSwitch = ({ isHot, setIsHot }: FeedSwitchProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const updateIndex = () => {
    if (activeIndex === 0) {
      slideRight();
      setActiveIndex(1);
    } else {
      slideLeft();
      setActiveIndex(0);
    }
  };

  const handleViewRef = useRef<any>(null);

  const slideRight = () => {
    handleViewRef.current.animate({
      0: {
        translateX: 0,
      },
      0.5: {
        translateX: componentWidth / 4,
      },
      1: {
        translateX: componentWidth / 2 - 2,
      },
    });
  };

  const slideLeft = () => {
    handleViewRef.current.animate({
      0: {
        translateX: componentWidth / 2 - 5,
      },
      0.5: {
        translateX: componentWidth / 4,
      },
      1: {
        translateX: 0,
      },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={updateIndex}>
      <View
        style={styles.backgroundSwitch}
        onLayout={(event) => {
          componentWidth = event.nativeEvent.layout.width;
        }}
      >
        <Animatable.View
          duration={500}
          style={styles.buttonSwitch}
          ref={handleViewRef}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={[styles.textOption]}>Hot</Text>
          <Text style={[styles.textOption]}>New</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  backgroundSwitch: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: Colors.light.switchBackgroundColor,
    height: 32,
    width: 100,
    borderRadius: 100,
    justifyContent: "center",
    // shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  textOption: {
    fontWeight: "bold",
    width: "50%",
    textAlign: "center",
    color: Colors.light.switchFontColor,
  },
  buttonSwitch: {
    position: "absolute",
    backgroundColor: "white",
    height: 27,
    width: 46,
    borderRadius: 100,
    left: 3,
    right: 3,
  },
});

export default FeedSwitch;
