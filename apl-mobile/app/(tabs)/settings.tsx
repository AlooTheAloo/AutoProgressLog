import {
  Image,
  StyleSheet,
  Platform,
  Alert,
  View,
  Text,
  useColorScheme,
} from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TitleThemedText } from "@/components/TitleThemedText";

import { useEffect } from "react";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { router } from "expo-router";

type SettingOption = {
  title: string;
  description: string;
  icon: IconSymbolName;
};

const settingOptions: SettingOption[] = [
  {
    title: "General",
    description: "General app settings.",
    icon: "gearshape.fill",
  },
  {
    title: "Account",
    description: "APL account settings.",
    icon: "person.crop.circle.fill",
  },
  {
    title: "Appearance",
    description: "Customize the app's appearance.",
    icon: "paintbrush.pointed.fill",
  },
];

export default function Settings() {
  const colorScheme = useColorScheme();

  const settingOptionsViews = settingOptions.map((settingOption, i) => {
    return (
      <ThemedView
        key={i}
        className="flex flex-row gap-4 rounded-xl p-3 justify-center items-center"
      >
        <IconSymbol
          size={24}
          name={settingOption.icon}
          color={colorScheme == "light" ? "black" : "white"}
          weight="bold"
        />
        <ThemedView className="flex flex-col flex-grow">
          <TitleThemedText
            fontSize={20}
            string={settingOption.title}
          ></TitleThemedText>
          <ThemedText className="truncate text-gray-400">
            {settingOption.description}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  });

  return (
    <View style={styles.container}>
      <TitleThemedText fontSize={25} string={"Settings"}></TitleThemedText>

      <View className="flex flex-col flex-grow gap-5 mt-5">
        {settingOptionsViews}
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
