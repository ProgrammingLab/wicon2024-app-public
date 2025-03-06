import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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

import firebaseErrorHandler from "@/lib/firebaseErrorHandler";
import i18n from "@/lib/i18n";

export default function SignIn() {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<
    "off" | "submitting" | "submitted"
  >("off");

  const schema = z.object({
    email: z
      .string()
      .min(1, i18n.t("emailRequired"))
      .email(i18n.t("invalidEmail")),

    password: z
      .string()
      .min(1, i18n.t("passwordRequired"))
      .min(6, i18n.t("passwordTooShort")),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setErrorMessage(null);
    setStatus("submitting");
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, data.email, data.password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("signed in");
        console.log({ user });

        if (!user.emailVerified) {
          router.push("/signup/verifyEmail");
        } else {
          router.push("/");
        }
      })
      .catch((error) => {
        console.log("Failed to sign in");
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log({ errorCode, errorMessage });
        setErrorMessage(firebaseErrorHandler(errorCode));
      });
    console.log("idToken: ", await auth.currentUser?.getIdToken());
    setStatus("submitted");
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
        {process.env.NODE_ENV === "development" && (
          <SizableText size="$4">
            開発の時はこのアカウントを使って！ user: a@a.aa passoword: 123456
          </SizableText>
        )}
        <Label>{i18n.t("emailAddress")}</Label>
        <Controller
          name="email"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Input value={field.value} onChangeText={field.onChange} />
          )}
        />
        {errors.email && (
          <SizableText size="$2">{errors.email.message}</SizableText>
        )}
        <Label>{i18n.t("password")}</Label>
        <Controller
          name="password"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Input
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        {errors.password && (
          <SizableText size="$2">{errors.password.message}</SizableText>
        )}
      </YStack>
      <Button
        icon={status === "submitting" ? () => <Spinner /> : undefined}
        onPress={handleSubmit(onSubmit)}
      >
        {i18n.t("signIn")}
      </Button>
      <Label>{i18n.t("youDontHaveAnAccount")}</Label>
      <Button
        onPress={() => {
          router.push("/signup");
        }}
      >
        {i18n.t("signUp")}
      </Button>
      {process.env.NODE_ENV === "development" && (
        <Button onPress={() => router.push("/serverSelection")}>
          Change backend server or Firebase emulator
        </Button>
      )}
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
