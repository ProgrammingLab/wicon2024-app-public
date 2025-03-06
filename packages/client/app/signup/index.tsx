import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "backend/src/schema/user";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  updateProfile,
} from "firebase/auth";
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

import Select from "@/components/Select";
import firebaseErrorHandler from "@/lib/firebaseErrorHandler";
import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

export default function SignUp() {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [okFunc, setOkFunc] = React.useState<{ func: () => void }>({
    func: () => {},
  });
  const schema = z
    .object({
      name: z.string().min(1, i18n.t("nameRequired")).max(32),
      email: z
        .string()
        .min(1, i18n.t("emailRequired"))
        .email(i18n.t("invalidEmail")),
      password: z
        .string()
        .min(1, i18n.t("passwordRequired"))
        .min(6, i18n.t("passwordTooShort")),
      passwordConfirm: z
        .string()
        .min(1, i18n.t("passwordRequired"))
        .min(6, i18n.t("passwordTooShort")),
      country: userSchema.shape.country,
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: i18n.t("passwordIsNotMatch"),
      path: ["passwordConfirm"],
    });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const [status, setStatus] = React.useState<
    "off" | "submitting" | "submitted"
  >("off");

  const onSubmit = (data: z.infer<typeof schema>) => {
    setStatus("submitting");
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("signed in");
        console.log({ user });

        // Add user to db
        try {
          const res = await (
            await client()
          ).api.users.$post({ json: { id: user.uid, country: data.country } });
          if (!res.ok) {
            console.log("Failed to add user to db");
            console.log(await res.json());
            setErrorMessage(i18n.t("failedToConnectToServer"));

            setOkFunc({
              func: async () => {
                if (auth.currentUser) {
                  await deleteUser(auth.currentUser);
                  console.log("Deleted user");
                }
              },
            });

            return;
          }
        } catch (e) {
          console.log("Failed to add user to db2");
          console.log(e);
          setErrorMessage(i18n.t("failedToConnectToServer"));
          setOkFunc({
            func: async () => {
              if (auth.currentUser) {
                await deleteUser(auth.currentUser);
                console.log("Deleted user");
              }
            },
          });
          return;
        }

        // set user name
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            displayName: data.name,
          });
        } else {
          console.log("Failed to set user name");
          setErrorMessage(i18n.t("failedToConnectToServer"));
          return;
        }

        router.push("/signup/verifyEmail");
      })
      .catch((error) => {
        console.log("Failed to sign up");
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log({ errorCode, errorMessage });
        setErrorMessage(firebaseErrorHandler(errorCode));
        setOkFunc({
          func: () => {
            router.push("/signup");
          },
        });
      });

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
        <Label>{i18n.t("name")}</Label>
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
        <Label>{i18n.t("country")}</Label>
        <Controller
          name="country"
          control={control}
          defaultValue={
            Object.keys(userSchema.shape.country._def.values)[0] as z.infer<
              typeof userSchema.shape.country
            >
          }
          render={({ field }) => (
            <Select
              options={Object.keys(userSchema.shape.country._def.values).map(
                (val) => ({
                  label: val,
                  value: val,
                }),
              )}
              selectedValue={field.value}
              onValueChange={(val) => field.onChange(val.toString())}
            />
          )}
        />
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
        <Label>{i18n.t("confirmPassword")}</Label>
        <Controller
          name="passwordConfirm"
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
        {errors.passwordConfirm && (
          <SizableText size="$2">{errors.passwordConfirm.message}</SizableText>
        )}
      </YStack>
      <Button
        icon={status === "submitting" ? () => <Spinner /> : undefined}
        onPress={handleSubmit(onSubmit)}
      >
        {i18n.t("signUp")}
      </Button>
      <Label>{i18n.t("youAlreadyHaveAnAccount")}</Label>
      <Button
        onPress={() => {
          router.push("/signin");
        }}
      >
        {i18n.t("signIn")}
      </Button>
      <AlertDialog
        open={!!errorMessage}
        onOpenChange={() => {
          setErrorMessage(null);
          setOkFunc({ func: () => {} });
        }}
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
                  okFunc.func();
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
