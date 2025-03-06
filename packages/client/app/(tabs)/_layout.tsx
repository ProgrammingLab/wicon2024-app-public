import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Book } from "@tamagui/lucide-icons";
import { Navigation2 } from "@tamagui/lucide-icons";
import { router, Tabs } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import React, { useEffect } from "react";
import { Avatar, Button, Popover, SizableText, Square, YStack } from "tamagui";

import { useAuthContext } from "@/context/auth";
import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

export default function RootLayout() {
  const auth = useAuthContext();
  const [photoURL, setPhotoURL] = React.useState<string | null>(null);
  const [groupName, setGroupName] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!auth.currentUser) return;
    setPhotoURL(auth.currentUser.photoURL);

    const fetch = async () => {
      if (!auth.currentUser) return;

      const groups = await (
        await client()
      ).api.users[":id"].groups.$get({ param: { id: auth.currentUser.uid } });
      if (!groups.ok) return;
      const groupsJson = await groups.json();
      if (!groupsJson) return;

      const group = await (
        await client()
      ).api.groups[":id"].$get({
        param: { id: groupsJson[0].groupId },
      });
      if (!group.ok) return;
      const groupJson = await group.json();
      if (!groupJson) return;
      setGroupName(groupJson.name);
    };
    fetch();
  }, [auth]);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "blue",
        headerRight: () => (
          <>
            <Popover
              allowFlip
              open={open}
              keepChildrenMounted
              stayInFrame
              offset={{ crossAxis: -10 }}
              placement="bottom-end"
            >
              <Popover.Trigger asChild>
                <Avatar circular margin="$3">
                  {photoURL && <Avatar.Image src={photoURL} />}
                  <Avatar.Fallback backgroundColor="$blue10" />
                </Avatar>
              </Popover.Trigger>

              <Popover.Content
                borderWidth={1}
                borderColor="$borderColor"
                enterStyle={{ y: -10, opacity: 0 }}
                exitStyle={{ y: -10, opacity: 0 }}
                elevate
                animation={[
                  "quick",
                  {
                    opacity: {
                      overshootClamping: true,
                    },
                  },
                ]}
              >
                <YStack gap="$3">
                  <SizableText size="$6">{i18n.t("account")}</SizableText>
                  <Square
                    backgroundColor="$accentBackground"
                    borderRadius="$2"
                    padding="$3"
                    alignItems="unset"
                  >
                    <SizableText>{groupName}</SizableText>
                    <SizableText>{auth.currentUser?.displayName}</SizableText>
                    <SizableText>{auth.currentUser?.email}</SizableText>
                  </Square>
                  <Button
                    onPress={async () => {
                      await signOut(getAuth());
                      setOpen(false);
                    }}
                  >
                    {i18n.t("signOut")}
                  </Button>
                </YStack>
              </Popover.Content>
            </Popover>
          </>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={31} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nav/index"
        options={{
          title: i18n.t("nav"),
          tabBarIcon: ({ color }) => <Navigation2 size={28} color={color} />,
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push("/navigation");
          },
        })}
      />
      <Tabs.Screen
        name="cars/index"
        options={{
          title: i18n.t("cars"),
          tabBarIcon: ({ color }) => (
            <FontAwesome size={23} name="car" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cars/add"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cars/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="fields/index"
        options={{
          title: i18n.t("fields"),
          tabBarIcon: ({ color }) => (
            <FontAwesome size={25} name="map" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fields/add"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="fields/roads/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="fields/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="diaries/index"
        options={{
          title: i18n.t("diaries"),
          tabBarIcon: ({ color }) => <Book size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="diaries/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="diaries/add"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: i18n.t("settings"),
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="gear" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="diaries/crops/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="diaries/crops/add"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="diaries/fertilizers/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="diaries/fertilizers/add"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="diaries/pesticides/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="diaries/pesticides/add"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="diaries/diaryPack/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="diaries/diaryPack/add"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="diaries/export/index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
