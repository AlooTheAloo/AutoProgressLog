import { Image, StyleSheet, Platform, Alert, View, Text } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect } from "react";

export default function Reports() {
  return (
    <View>
      <Text
        style={{
          color: "white",
        }}
      >
        this is a reports page
      </Text>
    </View>
  );
}
