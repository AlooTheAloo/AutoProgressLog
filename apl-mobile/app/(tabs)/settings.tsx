import {
  Image,
  StyleSheet,
  Platform,
  Alert,
  View,
  Text,
  useColorScheme,
  TouchableHighlight,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TitleThemedText } from "@/components/TitleThemedText";

import { useEffect } from "react";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Href, router } from "expo-router";

type SettingOption = {
  title: string;
  description: string;
  icon: IconSymbolName;
  route: Href;
};

const settingOptions: SettingOption[] = [
  {
    title: "General",
    description: "General app settings.",
    icon: "gearshape.fill",
    route: "/settings/general",
  },
  {
    title: "Account",
    description: "APL account settings.",
    icon: "person.crop.circle.fill",
    route: "/settings/account",
  },
  {
    title: "Appearance",
    description: "Customize the app's appearance.",
    icon: "paintbrush.pointed.fill",
    route: "/settings/appearance",
  },
];

export default function Settings() {
  const settingOptionsViews = settingOptions.map((settingOption, i) => {
    return (
      <TouchableOpacity
        key={i}
        onPress={() => router.push(settingOption.route)}
      >
        <ThemedView className="flex flex-row gap-4 rounded-xl p-3 justify-center items-center mb-5">
          <IconSymbol size={24} name={settingOption.icon} color="#22A7D1" />
          <ThemedView className="flex flex-col flex-grow">
            <TitleThemedText
              fontSize={20}
              string={settingOption.title}
            ></TitleThemedText>
            <ThemedText
              style={{
                fontFamily: Platform.select({
                  android: "Inter_500Medium",
                  ios: "Inter-Medium",
                }),
                fontSize: 15,
              }}
              className="truncate"
            >
              {settingOption.description}
            </ThemedText>
          </ThemedView>
          <IconSymbol size={32} name="chevron.right" color="#22A7D1" />
        </ThemedView>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.container}>
      <TitleThemedText fontSize={25} string={"Settings"}></TitleThemedText>

      <ScrollView className="flex flex-col flex-grow mt-5">
        {settingOptionsViews}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginTop: 60,
  },
});
