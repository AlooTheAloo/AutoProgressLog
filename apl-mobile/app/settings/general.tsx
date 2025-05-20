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
  BackHandler,
} from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TitleThemedText } from "@/components/TitleThemedText";
import { IconSymbolName } from "@/components/ui/IconSymbol";
import { SettingElementType } from "../../types/settingElementType";
import SettingElement from "@/components/SettingElement";
import { useStorage } from "@/hooks/useStorage";

export default function General() {
  const [didSetupDB, setdidSetup] = useStorage("didSetup", "false"); // robert is the default value

  const settings: SettingElementType[] = [
    {
      label: "Nuke the fucking app",
      description: "Tap this button if you want to nuke the fucking app.",
      placeholderText: "NUKE IT",
      textColor: "red",
      action: () => {
        Alert.alert(
          "Confirm",
          "Are you sure you want to nuke the fucking app?",
          [
            {
              text: "no :(",
              style: "cancel",
            },
            {
              text: "LETS GO",
              onPress: () => {
                setdidSetup("false");
                BackHandler.exitApp();
              },
            },
          ],
          { cancelable: false }
        );
      },
    },
  ];

  return (
    <View style={styles.container}>
      <TitleThemedText fontSize={25} string={"General"}></TitleThemedText>

      <ScrollView className="mt-5">
        {settings.map((elem, i) => {
          return (
            <SettingElement
              key={i}
              placeholderText={elem.placeholderText}
              label={elem.label}
              description={elem.description}
              action={elem.action}
              textColor={elem.textColor}
            />
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
