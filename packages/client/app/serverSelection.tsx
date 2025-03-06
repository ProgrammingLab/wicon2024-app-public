import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { Button, Input, SizableText, YStack } from "tamagui";

export default function ServerSelection() {
  const [backend, setBackend] = React.useState("");
  const [firebase, setFirebase] = React.useState("");

  useEffect(() => {
    const set = async () => {
      setFirebase((await AsyncStorage.getItem("firebaseEmulator")) || "");
      setBackend((await AsyncStorage.getItem("backend")) || "");
    };
    set();
  }, []);
  return (
    <YStack>
      <SizableText>Backend Server</SizableText>
      <Input value={backend} onChangeText={(value) => setBackend(value)} />
      <SizableText>Firebase Emulator</SizableText>
      <Input value={firebase} onChangeText={(value) => setFirebase(value)} />
      <Button
        onPress={async () => {
          await AsyncStorage.setItem("backend", backend);
          await AsyncStorage.setItem("firebaseEmulator", firebase);
        }}
      >
        Set
      </Button>

      <Button
        onPress={() => {
          setBackend("");
          setFirebase("");
          AsyncStorage.removeItem("backend");
          AsyncStorage.removeItem("firebaseEmulator");
        }}
      >
        Revert to default
      </Button>
      <SizableText>
        Please restart the app to apply the changes after pressing the Set or
        Revert to default button.
      </SizableText>
    </YStack>
  );
}
