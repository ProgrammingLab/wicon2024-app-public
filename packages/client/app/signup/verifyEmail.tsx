import { useRouter } from "expo-router";
import { getAuth, sendEmailVerification } from "firebase/auth";
import React, { useEffect } from "react";
import { Button, Form, SizableText, Spinner, YStack } from "tamagui";

import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

export default function VerifyEmail() {
  const router = useRouter();
  const [status, setStatus] = React.useState<
    "off" | "submitting" | "submitted"
  >("off");
  const auth = getAuth();
  const [haveGroup, setHaveGroup] = React.useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!auth.currentUser) return;
      const res = await (
        await client()
      ).api.users[":id"].groups.$get({ param: { id: auth.currentUser?.uid } });
      if (!res.ok) return;
      const resJson = await res.json();
      if (!resJson) return;
      setHaveGroup(resJson.length > 0);
    };
    fetch();
  });

  const onSubmit = () => {
    setStatus("submitting");
    if (!auth.currentUser) {
      console.log("User is not signed in");
      return;
    }
    sendEmailVerification(auth.currentUser).then(() => {
      console.log("email sent");
    });
    setStatus("submitted");
  };

  return (
    <Form
      alignItems="center"
      minWidth={300}
      gap="$2"
      onSubmit={onSubmit}
      borderWidth={1}
      borderRadius="$4"
      backgroundColor="$background"
      borderColor="$borderColor"
      padding="$8"
    >
      <YStack gap="$2">
        <SizableText size="$8">{i18n.t("verifyEmail")}</SizableText>
      </YStack>
      <Form.Trigger asChild disabled={status !== "off"}>
        <Button icon={status === "submitting" ? () => <Spinner /> : undefined}>
          {i18n.t("sendMeAnVerificationEmail")}
        </Button>
      </Form.Trigger>
      {status === "submitted" && (
        <>
          <SizableText size="$4">{i18n.t("emailWasSent")}</SizableText>
          {!haveGroup ? (
            <Button onPress={() => router.push("/signup/createGroup")}>
              {i18n.t("next")}
            </Button>
          ) : (
            <Button
              onPress={async () => {
                await auth.currentUser?.reload();
                router.push("/(tabs)/");
              }}
            >
              {i18n.t("next")}
            </Button>
          )}
        </>
      )}
    </Form>
  );
}
