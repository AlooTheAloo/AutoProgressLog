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
import { SettingElementType } from "./types";
import SettingElement from "@/components/SettingElement";
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";

const storage = new MMKVLoader().initialize();

export default function Account() {
  const [user, setUser] = useMMKVStorage("user", storage, "undefined");

  const showAlert = () => {
    console.log("caca");
    Alert.prompt("Change account name", "message");
  };

  const settings: SettingElementType[] = [
    {
      label: "Name",
      description: "Change your account name.",
      placeholderText: user,
      onChange: showAlert,
    },
  ];

  return (
    <View style={styles.container}>
      <TitleThemedText fontSize={25} string={"Account"}></TitleThemedText>

      <ScrollView className=" mt-5">
        {settings.map((elem, i) => {
          return (
            <SettingElement
              key={i}
              onChange={elem.onChange}
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
