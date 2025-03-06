import React from "react";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView, XGroup, XStack, YGroup, YStack } from "tamagui";
import { ListItem } from "tamagui";

import { AccountSettings } from "@/components/settings/account";
import { GroupSettings } from "@/components/settings/group";
import { NtripSettings } from "@/components/settings/ntrip";
import { ReceiverSettings } from "@/components/settings/receiver";
import i18n from "@/lib/i18n";

export default function Dropdown() {
  const [selectedItem, setSelectedItem] = useState("account");

  const handleSelect = (item: string) => {
    setSelectedItem(item);
  };
  return (
    <XStack padding="$2">
      <YStack gap="$2" width="100%">
        <XGroup>
          <XGroup.Item>
            <YGroup bordered width={240} size="$4">
              {/*
              <YGroup.Item>
                <ListItem hoverTheme onPress={() => handleSelect("group")}>
                  {i18n.t("groupSettings")}
                </ListItem>
              </YGroup.Item>
              */}
              <YGroup.Item>
                <ListItem hoverTheme onPress={() => handleSelect("account")}>
                  {i18n.t("accountSettings")}
                </ListItem>
              </YGroup.Item>
              <YGroup.Item>
                <ListItem hoverTheme onPress={() => handleSelect("ntrip")}>
                  {i18n.t("ntripSettings")}
                </ListItem>
              </YGroup.Item>
              {/*
              <YGroup.Item>
                <ListItem hoverTheme onPress={() => handleSelect("receiver")}>
                  {i18n.t("receiverSettings")}
                </ListItem>
              </YGroup.Item>
              */}
            </YGroup>
          </XGroup.Item>
          <XGroup.Item>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
              keyboardVerticalOffset={100}
            >
              <ScrollView width="100%" height="100%">
                {selectedItem === "group" && <GroupSettings />}
                {selectedItem === "account" && <AccountSettings />}
                {selectedItem === "ntrip" && <NtripSettings />}
                {selectedItem === "receiver" && <ReceiverSettings />}
              </ScrollView>
            </KeyboardAvoidingView>
          </XGroup.Item>
        </XGroup>
      </YStack>
    </XStack>
  );
}
