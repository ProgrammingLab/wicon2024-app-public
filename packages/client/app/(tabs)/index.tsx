import { MailWarning } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { Button, Card, ScrollView, SizableText, XStack, YStack } from "tamagui";

import { useAuthContext } from "@/context/auth";
import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

import DiaryList from "../../components/home/diaryList";
import Weather from "../../components/home/weather";

export default function Home() {
  const [userName, setUserName] = React.useState<string | undefined>(undefined);
  const [groupName, setGroupName] = React.useState<string | undefined>(
    undefined,
  );
  const [emailVerified, setEmailVerified] = React.useState<
    boolean | undefined
  >();
  const auth = useAuthContext();

  React.useEffect(() => {
    const fetchData = async () => {
      const id = auth.currentUser?.uid;
      if (!id) return;
      const res = auth.currentUser?.displayName;
      if (!res) return;
      setUserName(res);

      const groupListRes = await (
        await client()
      ).api.users[":id"].groups.$get({ param: { id: id } });
      if (!groupListRes.ok) return;
      const groupListJson = await groupListRes.json();

      const groupRes = await (
        await client()
      ).api.groups[":id"].$get({
        param: { id: groupListJson[0].groupId },
      });
      if (!groupRes.ok) return;
      const groupJson = await groupRes.json();
      if (!groupJson) return;
      setGroupName(groupJson.name);
    };
    fetchData();
    setEmailVerified(auth.currentUser?.emailVerified);
  }, [auth]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView width="100%" flex={1} contentContainerStyle={{ flexGrow: 1 }}>
        <XStack padding="$2">
          <YStack gap="$2" width="100%">
            <SizableText>
              {groupName} {userName} さん、こんにちは！
            </SizableText>
            {emailVerified === false && (
              <Card margin="$3">
                <Card.Header
                  padding="0"
                  paddingBlock="$3"
                  paddingHorizontal="$4"
                >
                  <XStack gap="$3" alignItems="center">
                    <MailWarning />
                    <SizableText size="$6">{i18n.t("important")}</SizableText>
                  </XStack>
                </Card.Header>
                <YStack marginHorizontal="$10" marginBottom="$3" zIndex={100}>
                  <SizableText>{i18n.t("pleaseVerifyEmail")}</SizableText>
                  <Button onPress={() => router.push("/signup/verifyEmail")}>
                    {i18n.t("verifyEmail")}
                  </Button>
                </YStack>
                <Card.Background
                  backgroundColor="rgb(147 114 220)"
                  borderRadius={15}
                />
              </Card>
            )}
            <Weather />
            <DiaryList />
          </YStack>
        </XStack>
        {/*
        <Link href="/logger">
          <ThemedText>ログ出力確認画面へ</ThemedText>
        </Link>
        */}
      </ScrollView>
    </SafeAreaView>
  );
}
