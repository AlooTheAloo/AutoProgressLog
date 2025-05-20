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

// prevent splash from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function SetupLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen
          name="index"
          options={{
            title: "Get Started",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="toggl-setup"
          options={{
            title: "Connect to Toggl",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="toggl-setup-result"
          options={{
            title: "Confirm Toggl Account",
            headerShown: true,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
