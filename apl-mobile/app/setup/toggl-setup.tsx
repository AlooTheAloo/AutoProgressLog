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

export default function TogglSetup() {
  const [didSetup, setdidSetup] = useStorage("didSetup", "false"); // robert is the default value
  const [apiKeyFilled, setapiKeyFilled] = useState(false);
  const [apiKey, setapiKey] = useState("");

  return (
    <View
      className="flex flex-col gap-5 h-full justify-center"
      style={styles.container}
    >
      <TitleThemedText
        fontSize={25}
        string={"Connect to your Toggl Track account"}
      ></TitleThemedText>
      <TouchableOpacity
        onPress={() => {
          Linking.openURL("https://track.toggl.com/profile");
        }}
      >
        <View
          className="w-[300px] p-3 !rounded-full
                   !bg-[#731768] !text-white flex flex-row items-center justify-center
                   !border-none"
        >
          <Image
            source={require("@/assets/images/toggl-icon.png")}
            alt="Toggl Track"
            className="w-8 h-8 mr-2"
          />
          <Text
            style={{
              fontFamily: Platform.select({
                android: "Inter_500Medium",
                ios: "Inter-Medium",
              }),
              fontSize: 15,
              color: "white",
            }}
          >
            Open Toggl Track profile page
          </Text>
        </View>
      </TouchableOpacity>
      <InputSettingElement
        onChange={(text: string) => {
          console.log("wtf");
          setapiKeyFilled(text.length === 0);
          setapiKey(text);
        }}
        placeholderText="Enter your API token here"
        label={"TOGGL API KEY"}
        description={
          "Please enter your Toggl Track API Token. This key can be found at the bottom of your profile settings page."
        }
      ></InputSettingElement>
      <SquircleButton
        enabled={apiKeyFilled}
        action={async () => {
          const toggl = new Toggl({
            auth: {
              token: apiKey,
            },
          });
          const me = await toggl.me.get();
          console.log(me);
          Alert.alert("WOW!", JSON.stringify(me));
          setdidSetup("true");
          router.replace("/(tabs)");
        }}
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
