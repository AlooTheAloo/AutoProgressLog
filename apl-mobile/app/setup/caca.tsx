import { View, Text, Button, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";

export default function SetupScreen() {
  return (
    <ThemedView
      style={{
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ThemedText
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: 25,
        }}
      >
        PROOOUT
      </ThemedText>
    </ThemedView>
  );
}

function finalizeSetup() {}
