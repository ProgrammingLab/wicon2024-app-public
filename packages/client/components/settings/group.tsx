import React, { useState } from "react";
import {
  Button,
  H1,
  H3,
  Input,
  ListItem,
  Separator,
  Text,
  XStack,
  YStack,
} from "tamagui";

import i18n from "@/lib/i18n";

export function GroupSettings() {
  const [inputValue, setInputValue] = useState("");
  const [inputID, setInputID] = useState("");

  const users = [
    { name: "aa", role: "admin" },
    { name: "bb", role: "user" },
  ];

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleSubmit = () => {
    console.log("Submitted Value:", inputValue); // Log the input value to the console
  };

  const handleInputID = (ID: string) => {
    setInputID(ID);
  };

  const handleSubmitID = () => {
    console.log("Submitted Value ID:", inputID);
  };

  const handleListItems = () => {
    console.log("plessedListItem");
  };

  const ListItems = users.map((user, index) => (
    <ListItem key={index} hoverTheme pressTheme onPress={handleListItems}>
      <YStack>
        <Text>{user.name}</Text>
        <Text>{user.role}</Text>
      </YStack>
    </ListItem>
  ));

  return (
    <XStack padding="$2">
      <YStack gap="$2" width="100%">
        <H1>{i18n.t("groupSettings")}</H1>

        <Separator alignSelf="stretch" borderColor={"$color"} />

        {/* Group Settings */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          gap="$3"
          paddingLeft="$4"
        >
          <H3>{i18n.t("groupSettingsD")}</H3>
          <XStack>
            <Input
              size="$4"
              borderWidth={2}
              width={300}
              placeholder={i18n.t("groupSettingsD")}
              value={inputValue}
              onChangeText={handleInputChange}
            />
            <Button onPress={handleSubmit} variant="outlined">
              {i18n.t("submit")}
            </Button>
          </XStack>
        </XStack>
        {/*invite menbers*/}
        <H1>{i18n.t("invite")}</H1>
        <Separator alignSelf="stretch" borderColor={"$color"} />
        <XStack
          alignItems="center"
          justifyContent="flex-end"
          gap="$3"
          paddingLeft="$4"
        >
          <Input
            size="$4"
            borderWidth={2}
            width={300}
            placeholder={i18n.t("idInput")}
            value={inputID}
            onChangeText={handleInputID}
          />
          <Button onPress={handleSubmitID} variant="outlined">
            {i18n.t("inviteButton")}
          </Button>
        </XStack>
        {/*menbers list*/}
        <YStack $sm={{ flexDirection: "column" }} paddingHorizontal="$4" space>
          {ListItems}
        </YStack>
      </YStack>
    </XStack>
  );
}
