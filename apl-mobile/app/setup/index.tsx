import { View, StyleSheet, Image } from "react-native";

import { TitleThemedText } from "@/components/TitleThemedText";
import { router } from "expo-router";
import SquircleButton from "@/components/ui/SquircleButton";

export default function SetupScreen() {
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
