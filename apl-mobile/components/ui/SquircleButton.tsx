import { Platform, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";
import { IconSymbol } from "./IconSymbol";

interface SquircleButtonProps {
  action: () => void;
  title: string;
  enabled?: boolean;
}

export default function SquircleButton(props: SquircleButtonProps) {
  return (
    <TouchableOpacity
      style={props.enabled ? styles.disabled : ""}
      disabled={props.enabled}
      onPress={props.action}
    >
      <ThemedView className="flex flex-row gap-4 rounded-xl p-3 justify-center items-center mb-3">
        <ThemedView className="flex flex-col">
          <ThemedText
            style={{
              fontFamily: Platform.select({
                android: "Inter_500Medium",
                ios: "Inter-Medium",
              }),
              fontSize: 15,
            }}
          >
            {props.title}
          </ThemedText>
        </ThemedView>
        <IconSymbol size={25} name="chevron.right" color="#22A7D1" />
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.4,
  },
});
