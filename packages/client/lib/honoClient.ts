import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { auth } from "@/firebaseConfig";

import { hcWithType } from "../../backend/dist/src/honoClient";

let host = "http://localhost:3000";
if (Platform.OS === "android") {
  host = "http://10.0.2.2:3000";
}

if (
  process.env.NODE_ENV !== "development" &&
  process.env.EXPO_PUBLIC_BACKEND_URL
) {
  host = process.env.EXPO_PUBLIC_BACKEND_URL;
}

export const client = async () => {
  host = (await AsyncStorage.getItem("backend")) || host;
  return hcWithType(`${host}`, {
    headers: {
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
  });
};
