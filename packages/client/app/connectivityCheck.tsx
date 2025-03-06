import { Toast, ToastViewport } from "@tamagui/toast";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

export default function ConnectivityCheck() {
  const { top } = useSafeAreaInsets();
  const [connected, setConnected] = useState<boolean | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const interval = process.env.NODE_ENV === "development" ? 1000 : 5000;
  setInterval(async () => {
    (await client()).api["connectivity-check"]
      .$get()
      .then((res) => {
        if (res.ok) {
          setConnected(true);
        } else {
          setConnected(false);
        }
      })
      .catch(() => {
        setConnected(false);
      });
  }, interval);
  useEffect(() => {
    if (connected === undefined) return;
    setOpen(true);
  }, [connected]);
  return (
    <>
      <Toast
        open={open}
        onOpenChange={setOpen}
        duration={connected ? 1000 : 30000}
        backgroundColor={connected ? "greenyellow" : "red"}
        enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
        exitStyle={{ opacity: 0, scale: 1, y: -20 }}
        opacity={1}
        scale={1}
        animation="100ms"
      >
        <Toast.Title color={connected ? "black" : "white"} textAlign="center">
          {i18n.t("Connectivity Check")}
        </Toast.Title>
        <Toast.Description
          color={connected ? "black" : "white"}
          textAlign="center"
        >
          {connected ? i18n.t("connected") : i18n.t("disconnected")}
        </Toast.Description>
      </Toast>
      <ToastViewport top={top} right={0} left={0} />
    </>
  );
}
