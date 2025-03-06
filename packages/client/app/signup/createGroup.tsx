import { zodResolver } from "@hookform/resolvers/zod";
import { groupSchema } from "backend/src/schema/group";
import { router } from "expo-router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  AlertDialog,
  Button,
  Input,
  Label,
  SizableText,
  Spinner,
  View,
  YStack,
} from "tamagui";
import { z } from "zod";

import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

export default function SignUp() {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const formSchema = groupSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [status, setStatus] = React.useState<
    "off" | "submitting" | "submitted"
  >("off");

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setStatus("submitting");

    const res = await (
      await client()
    ).api.groups.$post({ json: { name: data.name } });
    if (!res.ok) {
      const json = await res.json();
      setErrorMessage(json.message);
      setStatus("off");
      return;
    }

    setStatus("submitted");
    router.push("/");
  };

  return (
    <View
      alignItems="center"
      minWidth={300}
      gap="$2"
      borderWidth={1}
      borderRadius="$4"
      backgroundColor="$background"
      borderColor="$borderColor"
      padding="$8"
    >
      <YStack
        minWidth="70%"
        overflow="hidden"
        space="$2"
        margin="$3"
        padding="$2"
      >
        <Label>{i18n.t("groupName")}</Label>
        <Controller
          name="name"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Input value={field.value} onChangeText={field.onChange} />
          )}
        />
        {errors.name && (
          <SizableText size="$2">{errors.name.message}</SizableText>
        )}
      </YStack>
      <Button
        icon={status === "submitting" ? () => <Spinner /> : undefined}
        onPress={handleSubmit(onSubmit)}
      >
        {i18n.t("create")}
      </Button>
      <AlertDialog
        open={!!errorMessage}
        onOpenChange={() => setErrorMessage(null)}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <AlertDialog.Content
            bordered
            elevate
            key="content"
            animation={[
              "quick",
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            x={0}
            scale={1}
            opacity={1}
            y={0}
          >
            <AlertDialog.Title>{i18n.t("error")}</AlertDialog.Title>
            <AlertDialog.Description>
              {errorMessage || ""}
            </AlertDialog.Description>
            <AlertDialog.Action asChild>
              <Button
                onPress={() => {
                  setErrorMessage(null);
                }}
              >
                {i18n.t("close")}
              </Button>
            </AlertDialog.Action>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </View>
  );
}
