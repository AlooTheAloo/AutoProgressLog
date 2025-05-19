import {
  Image,
  StyleSheet,
  Platform,
  Alert,
  View,
  Text,
  Button,
} from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TitleThemedText } from "@/components/TitleThemedText";
import { useEffect } from "react";
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";

const storage = new MMKVLoader().initialize();

export default function HomeScreen() {
  const [user, setUser] = useMMKVStorage("user", storage, "undefined");

  return (
    <View style={styles.container}>
      <View className="flex flex-col">
        <TitleThemedText
          fontSize={25}
          string={"Welcome back, " + user}
        ></TitleThemedText>
        <TitleThemedText
          fontSize={15}
          string={"Last synced 2 minutes ago"}
        ></TitleThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginTop: 60,
  },
});
