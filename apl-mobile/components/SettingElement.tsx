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
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { SettingElementType } from "@/app/settings/types";

export default function SettingElement(props: SettingElementType) {
  if (props.action) {
    return (
      <View className="flex flex-col">
        <ThemedText
          style={{
            fontFamily: Platform.select({
              android: "Inter_500Medium",
              ios: "Inter-Medium",
            }),
            fontSize: 15,
          }}
          className="p-5 mb-2"
        >
          {props.label}
        </ThemedText>
        <TouchableOpacity onPress={props.action}>
          <ThemedView className="flex flex-row gap-4 rounded-xl p-3 justify-center items-center mb-5">
            <ThemedView className="flex flex-col flex-grow">
              <ThemedText
                style={{
                  fontFamily: Platform.select({
                    android: "Inter_500Medium",
                    ios: "Inter-Medium",
                  }),
                  fontSize: 15,
                }}
              >
                {props.placeholderText}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <View className="flex flex-col">
        <ThemedText
          style={{
            fontFamily: Platform.select({
              android: "Inter_500Medium",
              ios: "Inter-Medium",
            }),
            fontSize: 15,
          }}
          className="p-5 mb-2"
        >
          {props.label}
        </ThemedText>
        <ThemedView className="flex flex-row gap-4 rounded-xl p-3 justify-center items-center mb-5">
          <ThemedView className="flex flex-col flex-grow">
            <ThemedText
              style={{
                fontFamily: Platform.select({
                  android: "Inter_500Medium",
                  ios: "Inter-Medium",
                }),
                fontSize: 15,
              }}
            >
              {props.placeholderText}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginTop: 60,
  },
});
