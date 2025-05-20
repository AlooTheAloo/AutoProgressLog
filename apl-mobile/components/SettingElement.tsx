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
import { SettingElementType } from "@/types/settingElementType";

export default function SettingElement(props: SettingElementType) {
  const colorScheme = useColorScheme();

  if (props.action) {
    return (
      <View className="flex flex-col mb-4">
        <ThemedText
          style={{
            fontFamily: Platform.select({
              android: "Inter_500Medium",
              ios: "Inter-Medium",
            }),
            fontSize: 13,
          }}
          className="p-5 mb-2"
        >
          {props.label.toUpperCase()}
        </ThemedText>
        <TouchableOpacity onPress={props.action}>
          <ThemedView className="flex flex-row gap-4 rounded-xl p-3 justify-center items-center mb-3">
            <ThemedView className="flex flex-col flex-grow">
              <ThemedText
                style={{
                  fontFamily: Platform.select({
                    android: "Inter_500Medium",
                    ios: "Inter-Medium",
                  }),
                  color:
                    props.textColor === undefined
                      ? colorScheme === "dark"
                        ? "white"
                        : "black"
                      : props.textColor,
                  fontSize: 15,
                }}
              >
                {props.placeholderText}
              </ThemedText>
            </ThemedView>
            <IconSymbol size={25} name="chevron.right" color="#22A7D1" />
          </ThemedView>
        </TouchableOpacity>
        <ThemedText
          style={{
            fontFamily: Platform.select({
              android: "Inter_500Medium",
              ios: "Inter-Medium",
            }),
            fontSize: 13,
            color: "#6b7280",
          }}
          className="text-gray-500"
        >
          {props.description}
        </ThemedText>
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
            fontSize: 12,
          }}
          className="p-5 mb-2"
        >
          {props.label}
        </ThemedText>
        <ThemedView className="flex flex-row gap-4 rounded-xl p-3 justify-center items-center mb-3">
          <ThemedView className="flex flex-col flex-grow">
            <ThemedText
              style={{
                fontFamily: Platform.select({
                  android: "Inter_500Medium",
                  ios: "Inter-Medium",
                }),
                fontSize: 15,
                color: props.textColor,
              }}
            >
              {props.placeholderText}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedText
          style={{
            fontFamily: Platform.select({
              android: "Inter_500Medium",
              ios: "Inter-Medium",
            }),
            fontSize: 13,
            color: "#6b7280",
          }}
          className="text-gray-500"
        >
          {props.description}
        </ThemedText>
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
