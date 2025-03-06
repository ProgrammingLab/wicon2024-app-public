import AsyncStorage from "@react-native-async-storage/async-storage";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  // @ts-expect-error for React Native
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);

export const auth =
  Platform.OS === "web"
    ? initializeAuth(app, {
        persistence: browserLocalPersistence,
      })
    : initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });

const useFirebaseEmulator = async () => {
  const isEmulating = process.env.NODE_ENV === "development";
  // const isEmulating = false;
  const savedEmulatorHost = await AsyncStorage.getItem("firebaseEmulator");
  if (isEmulating) {
    if (Platform.OS === "android") {
      connectAuthEmulator(auth, savedEmulatorHost || "http://10.0.2.2:9099", {
        disableWarnings: true,
      });
      console.log(
        "!!!! Using Firebase Auth Emulator !!!!",
        savedEmulatorHost || "http://10.0.2.2:9099",
      );
    } else {
      connectAuthEmulator(auth, savedEmulatorHost || "http://localhost:9099", {
        disableWarnings: true,
      });
      console.log(
        "!!!! Using Firebase Auth Emulator !!!!",
        savedEmulatorHost || "http://localhost:9099",
      );
    }
  }
};
useFirebaseEmulator();
