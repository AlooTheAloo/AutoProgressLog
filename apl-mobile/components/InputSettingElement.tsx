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
  TextInput,
} from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TitleThemedText } from "@/components/TitleThemedText";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { SettingElementType } from "@/types/settingElementType";
import { useState } from "react";

export default function InputSettingElement(props: SettingElementType) {
  const colorScheme = useColorScheme();
  const [text, setText] = useState("");

  return (
    <View className="flex flex-col mb-5">
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
          <TextInput
            onChangeText={(text: string) => {
              setText(text);
              props.onChange?.(text);
            }}
            placeholder={props.placeholderText}
            placeholderTextColor={"#9ca3af"}
            style={{
              fontFamily: Platform.select({
                android: "Inter_500Medium",
                ios: "Inter-Medium",
              }),
              fontSize: 15,
              color: colorScheme === "dark" ? "white" : "black",
            }}
          >
            {text}
          </TextInput>
        </ThemedView>
        <TouchableOpacity
          onPress={() => {
            setText("");
          }}
        >
          <IconSymbol size={25} name="delete.left" color="#22A7D1" />
        </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginTop: 60,
  },
});
