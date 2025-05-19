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

// prevent splash from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  // 1) load your “didSetup” flag
  const [didSetup, setDidSetup] = useState<boolean | null>(null);
  useEffect(() => {
    async function getFlag() {
      setDidSetup(false);
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
