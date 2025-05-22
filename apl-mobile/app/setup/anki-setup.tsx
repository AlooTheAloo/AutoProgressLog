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
import AnkiHTTPClient from "@/helpers/ankiHTTPClientHelper";

export default function AnkiSetup() {
  const [didSetup, setdidSetup] = useStorage<boolean>("didSetup", false); // robert is the default value

  const [ankiUsernameField, setAnkiUsernameField] = useState("");
  const [ankiPasswordField, setAnkiPasswordField] = useState("");

  async function tryAnkiLogin() {
    const httpClient = new AnkiHTTPClient("http://10.0.5.17:7272");
    const myKey = await httpClient.login(ankiUsernameField, ankiPasswordField);
    const realHttpClient = new AnkiHTTPClient(myKey, "http://10.0.5.17:7272");
    console.log(myKey);
    const dbDownloadedSuccessfully = await connectFromClient(realHttpClient);
    if (dbDownloadedSuccessfully) {
      console.log("holy shit it just works");
      router.push("/(tabs)");
    } else {
      Alert.alert(
        "Error connecting to AnkiWeb",
        "There was an errror while connecting to AnkiWeb. Make sure your device is connected to the network and that the credentials provided is valid."
      );
    }
  }

  async function connectFromClient(client: AnkiHTTPClient) {
    if (!client.isLoggedIn()) return false;

    return await client.downloadInitialDatabase("caca");
  }

  return (
    <View
      className="flex flex-col gap-5 justify-center"
      style={styles.container}
    >
      <TitleThemedText
        fontSize={25}
        string={"Time to connect to AnkiWeb."}
      ></TitleThemedText>
      <InputSettingElement
        onChange={setAnkiUsernameField}
        placeholderText="Enter your AnkiWeb email here."
        label={"ANKIWEB EMAIL"}
        entryType="email-address"
        description={""}
      ></InputSettingElement>
      <InputSettingElement
        onChange={setAnkiPasswordField}
        placeholderText="Enter your AnkiWeb password here."
        label={"ANKIWEB PASSWORD"}
        entryType="visible-password"
        description={""}
      ></InputSettingElement>
      <SquircleButton action={tryAnkiLogin} title={"Continue"}></SquircleButton>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginTop: 60,
  },
});
