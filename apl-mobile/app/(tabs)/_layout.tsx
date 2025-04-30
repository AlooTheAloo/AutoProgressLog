import { Tabs } from "expo-router";
import React from "react";
import { Platform, View, Text } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import PillShapeIcon from "@/components/ui/PillShapeIcon";

interface TabItem {
  displayName: string;
  icon: IconSymbolName;
  route: string;
}

const tabItems: TabItem[] = [
  { displayName: "Home", icon: "house.fill", route: "index" },
  {
    displayName: "Reports",
    icon: "chart.line.text.clipboard.fill",
    route: "reports",
  },
  { displayName: "Statistics", icon: "chart.bar.xaxis", route: "statistics" },
  { displayName: "Achievements", icon: "trophy.fill", route: "achievements" },
  { displayName: "Settings", icon: "gearshape.fill", route: "settings" },
];

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      {tabItems.map((tabItem, i) => {
        return (
          <Tabs.Screen
            key={i}
            name={tabItem.route}
            options={{
              title: tabItem.displayName,
              tabBarIcon: ({ color, focused }) => (
                <>
                  <PillShapeIcon
                    focused={focused}
                    iconSymbol={
                      <IconSymbol
                        size={24}
                        name={tabItem.icon}
                        color={focused ? "black" : "grey"}
                        weight="bold"
                      />
                    }
                  ></PillShapeIcon>
                </>
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}
