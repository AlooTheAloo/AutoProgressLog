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
import InputSettingElement from "@/components/InputSettingElement";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useStorage } from "@/hooks/useStorage";

export default function Account() {
  const [user, setUser] = useStorage("user", "");

  const [image, setImage] = useStorage("image", "");

  const setAccountName = (text: string) => {
    console.log("username changed to : " + text);
    setUser(text);
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const settings: SettingElementType[] = [
    {
      label: "ICON",
      description: "This image will be used in the whole application.",
      placeholderText: "Change Icon",
      action: pickImage,
    },
  ];

  return (
    <View style={styles.container}>
      <TitleThemedText fontSize={25} string={"Account"}></TitleThemedText>

      <ScrollView className="mt-5">
        <InputSettingElement
          onChange={setAccountName}
          placeholderText={user}
          label={"NAME"}
          description={"Enter your username."}
        ></InputSettingElement>

        <Image
          style={{
            height: 50,
            width: 50,
          }}
          source={{ uri: image! }}
        />
        {settings.map((elem, i) => {
          return (
            <SettingElement
              key={i}
              action={elem.action}
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
