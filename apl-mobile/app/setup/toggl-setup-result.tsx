import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Text,
  Linking,
  Alert,
} from "react-native";

import { useStorage } from "@/hooks/useStorage";
import { TitleThemedText } from "@/components/TitleThemedText";
import InputSettingElement from "@/components/InputSettingElement";
import SquircleButton from "@/components/ui/SquircleButton";
import { useState } from "react";
import Toggl from "@/services/toggl/index";
import { router } from "expo-router";
import { togglAccountInfo } from "@/types/toggl";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function TogglSetupResult() {
  const [togglAccountInfo, settogglAccountInfo] = useStorage<togglAccountInfo>(
    "togglAccountInfo",
    {
      displayName: "",
      emailAddress: "",
      profilePicture: "",
    }
  );

  function commitTogglAccountInfo() {
    // we kind of dont really need to commit anything because im based anyways
    router.push("/setup/anki-setup");
  }

  return (
    <View
      className="flex flex-col gap-5 h-full justify-center"
      style={styles.container}
    >
      <TitleThemedText
        fontSize={25}
        string={"We found this Toggl Track account!"}
      ></TitleThemedText>
      <ThemedView className="flex flex-row rounded-xl p-2 justify-between items-center">
        <View className="flex flex-row justify-center items-center gap-5">
          <Image
            height={30}
            width={30}
            className="rounded-full"
            source={{ uri: togglAccountInfo.profilePicture }}
          ></Image>
          <ThemedText
            style={{
              fontFamily: Platform.select({
                android: "Inter_900Bold",
                ios: "Inter-Black",
              }),
              fontSize: 16,
            }}
          >
            {togglAccountInfo.displayName}
          </ThemedText>
        </View>
        <IconSymbol size={25} name="checkmark.seal" color="#09db02" />
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
        User email : {togglAccountInfo.emailAddress}
      </ThemedText>

      <SquircleButton
        action={commitTogglAccountInfo}
        title={"Continue"}
      ></SquircleButton>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginTop: 60,
  },
});
