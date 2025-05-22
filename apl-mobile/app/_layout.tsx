import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import "../global.css";
import { useStorage } from "@/hooks/useStorage";

// prevent splash from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [didSetup, setdidSetup] = useStorage<boolean>("didSetup", false); // robert is the default value

  useEffect(() => {
    async function getFlag() {
      setdidSetup(!didSetup);
    }
    getFlag();
  }, []);

  // 3) once *both* are ready, hide splash & navigate
  useEffect(() => {
    if (didSetup !== null) {
      SplashScreen.hideAsync();
      router.replace(didSetup ? "/(tabs)" : "/setup");
    }
  }, [didSetup]);

  // don’t render anything until we know both flags
  if (didSetup === null) {
    return null;
  }

  // 4) a single Stack: expo-router will render the route
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
