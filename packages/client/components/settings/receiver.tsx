import React, { useState } from "react";
import {
  Button,
  H1,
  ListItem,
  Separator,
  XStack,
  YGroup,
  YStack,
} from "tamagui";

import i18n from "@/lib/i18n";

import Select from "../Select";

// Main component
export function ReceiverSettings() {
  // States for managing modal visibility, current field, and input value

  const [selectedItem, setSelectedItem] = useState<string>("bluetooth"); // State to track the selected item

  const handleReceiver = (value: string | number) => {
    setSelectedItem(value.toString());
    console.log("Receiver Selected:", value); // Log selected country immediately
  };

  const buttonBluetooth = () => {
    console.log("Bluetooth settings applied."); // Placeholder for Bluetooth button handler
  };

  const buttonUsb = () => {
    console.log("USB settings applied."); // Placeholder for USB button handler
  };

  return (
    <XStack padding="$2">
      <YStack gap="$2" width="100%">
        <H1>{i18n.t("receiverSettings")}</H1>
        <Separator alignSelf="stretch" borderColor={"$color"} />

        {/* Settings options */}
        <YGroup
          alignSelf="center"
          bordered
          width="100%"
          size="$5"
          separator={<Separator />}
        >
          {/* Receiver Selection */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title={i18n.t("receiverSelection")}
              iconAfter={
                <Select
                  options={[
                    { label: "Bluetooth", value: "bluetooth" },
                    { label: "USB", value: "usb" },
                  ]}
                  selectedValue={selectedItem}
                  onValueChange={handleReceiver}
                  placeholder="Choose a receiver"
                />
              }
            />
          </YGroup.Item>

          {/* Bluetooth Receiver Settings */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title={i18n.t("bluetoothReceiverSettings")}
              subTitle={i18n.t("inputDefaultSettingsToReceiver")}
              iconAfter={
                <Button variant="outlined" size={50}>
                  {i18n.t("submit")}
                </Button>
              }
              size={"$5"}
              onPress={buttonBluetooth}
            />
          </YGroup.Item>

          {/* USB Receiver Settings */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title={i18n.t("usbReceiverSettings")}
              subTitle={i18n.t("inputDefaultSettingsToReceiver")}
              iconAfter={
                <Button variant="outlined" size={50}>
                  {i18n.t("submit")}
                </Button>
              }
              size={"$5"}
              onPress={buttonUsb}
            />
          </YGroup.Item>
        </YGroup>
      </YStack>
    </XStack>
  );
}
