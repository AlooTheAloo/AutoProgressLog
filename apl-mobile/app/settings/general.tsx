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
} from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TitleThemedText } from "@/components/TitleThemedText";
import { IconSymbolName } from "@/components/ui/IconSymbol";
import { SettingElementType } from "./types";
import SettingElement from "@/components/SettingElement";

const settings: SettingElementType[] = [
  {
    label: "Skip setup",
    description: "General app settings.",
    placeholderText: "skip setup",
    action: () => {},
  },
];

export default function General() {
  return (
    <View style={styles.container}>
      <TitleThemedText fontSize={25} string={"General"}></TitleThemedText>

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
