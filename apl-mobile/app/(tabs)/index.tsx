import {
  Image,
  StyleSheet,
  Platform,
  Alert,
  View,
  Text,
  Button,
  useColorScheme,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TitleThemedText } from "@/components/TitleThemedText";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useStorage } from "@/hooks/useStorage";
import { router } from "expo-router";

dayjs.extend(duration);

const currentTime = dayjs();

export default function HomeScreen() {
  const [user, setUser] = useStorage("user", "");
  const [image, setImage] = useStorage("image", "");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);
  const colorScheme = useColorScheme();

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={styles.container}
    >
      <View className="flex flex-row justify-between">
        <View className="flex flex-col">
          <TitleThemedText
            fontSize={22}
            string={"Welcome back, " + user}
          ></TitleThemedText>
          <ThemedText
            style={{
              fontFamily: Platform.select({
                android: "Inter_500Medium",
                ios: "Inter-Medium",
              }),
              fontSize: 15,
            }}
          >
            Last synced {dayjs() + ""}
          </ThemedText>
        </View>
        <View className="flex flex-row justify-center items-center gap-5">
          <IconSymbol
            size={24}
            name="bell"
            color={colorScheme === "dark" ? "white" : "black"}
          />

          <TouchableOpacity
            onPress={() => {
              router.push("/settings/account");
            }}
          >
            <Image
              source={{
                uri: image!,
              }}
              className="w-14 h-14 rounded-full"
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginTop: 60,
  },
});
