// import "../tamagui-web.css";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { ToastProvider } from "@tamagui/toast";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalProvider, TamaguiProvider } from "tamagui";

import { AuthProvider } from "@/context/auth";

import { tamaguiConfig } from "../tamagui.config";
import ConnectivityCheck from "./connectivityCheck";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplash();
  }, []);

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
        <ToastProvider>
          <PortalProvider shouldAddRootHost>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <GestureHandlerRootView style={{ flex: 1 }}>
                <AuthProvider>
                  <ConnectivityCheck />
                  <Stack>
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="navigation"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="signin"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="signup"
                      options={{ headerShown: false }}
                    />
                  </Stack>
                </AuthProvider>
              </GestureHandlerRootView>
            </ThemeProvider>
          </PortalProvider>
        </ToastProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
