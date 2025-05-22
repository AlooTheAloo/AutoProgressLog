import React from "react";
import { ThemedText } from "./ThemedText";
import { Platform } from "react-native";

interface TitleThemedTextProps {
  string: string;
  fontSize: number;
}

export function TitleThemedText(props: TitleThemedTextProps) {
  return (
    <ThemedText
      style={{
        fontFamily: Platform.select({
          android: "Inter_700Bold",
          ios: "Inter-Black",
        }),
        fontSize: props.fontSize,
        textOverflow: "ellipsis",
        maxWidth: 350,
      }}
      className=" align-middle"
    >
      {props.string}
    </ThemedText>
  );
}
