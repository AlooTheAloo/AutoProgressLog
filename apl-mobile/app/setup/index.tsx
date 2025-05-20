import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  useColorScheme,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useStorage } from "@/hooks/useStorage";
import { TitleThemedText } from "@/components/TitleThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { router } from "expo-router";
import SquircleButton from "@/components/ui/SquircleButton";

export default function SetupScreen() {
  const [didSetup, setdidSetup] = useStorage("didSetup", "false"); // robert is the default value

  return (
    <View
      className="flex flex-col flex-grow gap-5 h-full justify-center"
      style={styles.container}
    >
      <Image
        source={require("@/assets/images/icon.png")}
        className=" w-20 h-20"
      />
      <TitleThemedText
        fontSize={25}
        string={"The immersion tracking app that just works."}
      ></TitleThemedText>
      <SquircleButton
        action={() => {
          router.push("/setup/toggl-setup");
        }}
        title={"Get Started"}
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
