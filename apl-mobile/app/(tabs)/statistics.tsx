import { Image, StyleSheet, Platform, Alert, View, Text } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { TitleThemedText } from "@/components/TitleThemedText";

import { ThemedView } from "@/components/ThemedView";
import { useEffect } from "react";

export default function Statistics() {
  return (
    <View style={styles.container}>
      <TitleThemedText fontSize={25} string={"Statistics"}></TitleThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginTop: 60,
  },
});
