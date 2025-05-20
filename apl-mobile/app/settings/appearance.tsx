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
import { SettingElementType } from "../../types/settingElementType";
import SettingElement from "@/components/SettingElement";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";

const settings: SettingElementType[] = [
  {
    label: "Skip setup",
    description: "General app settings.",
    placeholderText: "skip setup",
    action: () => {},
  },
];

export default function Appearance() {
  return (
    <View style={styles.container}>
      <View className="flex flex-row items-center">
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <IconSymbol size={25} name="chevron.left" color="#22A7D1" />
        </TouchableOpacity>
        <TitleThemedText fontSize={25} string={"Appearance"}></TitleThemedText>
      </View>

      <ScrollView className=" mt-5">
        {settings.map((elem, i) => {
          return (
            <SettingElement
              key={i}
              action={() => {}}
              placeholderText={elem.placeholderText}
              label={elem.label}
              description={elem.description}
            ></SettingElement>
          );
        })}
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
