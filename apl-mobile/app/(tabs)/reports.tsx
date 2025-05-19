import { Image, StyleSheet, Platform, Alert, View, Text } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TitleThemedText } from "@/components/TitleThemedText";
import { useEffect } from "react";

export default function Reports() {
  return (
    <View style={styles.container}>
      <TitleThemedText fontSize={25} string={"Reports"}></TitleThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginTop: 60,
  },
});
