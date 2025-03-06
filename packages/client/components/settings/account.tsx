import { ChevronRight } from "@tamagui/lucide-icons";
import { userSchema } from "backend/src/schema/user";
import { router } from "expo-router";
import {
  getAuth,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Button,
  H1,
  ListItem,
  Separator,
  SizableText,
  XStack,
  YGroup,
  YStack,
} from "tamagui";
import { z } from "zod";

import { useAuthContext } from "@/context/auth";
import firebaseErrorHandler from "@/lib/firebaseErrorHandler";
import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

import { UpdateModal } from "./update";

export function AccountSettings() {
  const [refresh, setRefresh] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameError, setNameError] = useState("");
  const [country, setCountry] = useState("");
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countryError, setCountryError] = useState("");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);

  const auth = useAuthContext();

  useEffect(() => {
    const fetch = async () => {
      if (!auth.currentUser) return;
      const user = await (
        await client()
      ).api.users[":id"].$get({ param: { id: auth.currentUser?.uid } });
      if (!user.ok) return;
      const userJson = await user.json();
      if (!userJson) return;
      setCountry(userJson.country);
    };

    fetch();
    setRefresh(false);
  }, [auth, refresh]);

  return (
    <XStack padding="$2" height={1000}>
      <YStack gap="$2" width="100%">
        <H1>{i18n.t("accountSettings")}</H1>
        <Separator alignSelf="stretch" borderColor={"$color"} />

        {/* Settings options */}
        <YGroup
          alignSelf="center"
          bordered
          width="100%"
          size="$5"
          separator={<Separator />}
        >
          {/* Email Address */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title={i18n.t("emailAddress")}
              iconAfter={
                <>
                  <SizableText>{auth.currentUser?.email}</SizableText>
                  <ChevronRight />
                </>
              }
              size={"$5"}
              onPress={() => setEmailModalOpen(true)}
            />
          </YGroup.Item>
          <UpdateModal
            type="input"
            label={i18n.t("emailAddress")}
            open={emailModalOpen}
            value={auth.currentUser?.email || ""}
            schema={z
              .string()
              .min(1, i18n.t("emailRequired"))
              .email(i18n.t("invalidEmail"))}
            submitFunc={async (val) => {
              if (!auth.currentUser) return;
              updateEmail(auth.currentUser, val)
                .then(() => {
                  setEmailModalOpen(false);
                  setEmailError("");
                  router.push("/signup/verifyEmail");
                })
                .catch((e) => {
                  console.error(e);
                  setEmailError(firebaseErrorHandler(e.code));
                });
            }}
            errorMessage={emailError}
            closeModal={() => {
              setEmailModalOpen(false);
              setEmailError("");
            }}
          />
          {/* Name */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title={i18n.t("name")}
              iconAfter={
                <>
                  <SizableText>{auth.currentUser?.displayName}</SizableText>
                  <ChevronRight />
                </>
              }
              size={"$5"}
              onPress={() => setNameModalOpen(true)}
            />
          </YGroup.Item>
          <UpdateModal
            type="input"
            label={i18n.t("name")}
            open={nameModalOpen}
            schema={z.string().min(1, i18n.t("nameRequired")).max(32)}
            value={auth.currentUser?.displayName || ""}
            submitFunc={async (val) => {
              if (!auth.currentUser) return;
              updateProfile(auth.currentUser, { displayName: val })
                .then(() => {
                  setNameModalOpen(false);
                  setNameError("");
                })
                .catch((e) => {
                  console.error(e);
                  setNameError(firebaseErrorHandler(e.code));
                });
            }}
            errorMessage={nameError}
            closeModal={() => {
              setNameModalOpen(false);
              setNameError("");
            }}
          />
          {/* Country */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title={i18n.t("country")}
              size={"$5"}
              onPress={() => setCountryModalOpen(true)}
              iconAfter={
                <>
                  <SizableText>{country}</SizableText>
                  <ChevronRight />
                </>
              }
            />
            <UpdateModal
              type="select"
              label={i18n.t("country")}
              open={countryModalOpen}
              schema={userSchema.shape.country}
              options={Object.keys(userSchema.shape.country._def.values).map(
                (val) => ({
                  label: val,
                  value: val,
                }),
              )}
              value={country}
              submitFunc={async (val) => {
                (await client()).api.users[":id"]
                  .$patch({
                    param: { id: auth.currentUser?.uid || "" },
                    json: { country: val as never },
                  })
                  .then(() => {
                    setCountryModalOpen(false);
                    setRefresh(true);
                    setCountryError("");
                  })
                  .catch(() => {
                    setCountryError("Failed to update country");
                  });
              }}
              errorMessage={countryError}
              closeModal={() => {
                setCountryModalOpen(false);
                setCountryError("");
              }}
            />
          </YGroup.Item>
          {/* Password */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title={i18n.t("password")}
              subTitle={i18n.t("resetPassword")}
              iconAfter={
                <>
                  <SizableText>*************</SizableText>
                  <ChevronRight />
                </>
              }
              size={"$5"}
              onPress={() => setPasswordModalOpen(true)}
            />
            <UpdateModal
              type="input"
              label={i18n.t("password")}
              open={passwordModalOpen}
              value=""
              schema={z
                .string()
                .min(1, i18n.t("passwordRequired"))
                .min(6, i18n.t("passwordTooShort"))}
              secureTextEntry
              submitFunc={(val) => {
                if (!auth.currentUser) return;
                updatePassword(auth.currentUser, val)
                  .then(() => {
                    setPasswordModalOpen(false);
                    setPasswordError("");
                  })
                  .catch((e) => {
                    console.error(e);
                    setPasswordError(firebaseErrorHandler(e.code));
                  });
              }}
              errorMessage={passwordError}
              closeModal={() => {
                setPasswordModalOpen(false);
                setPasswordError("");
              }}
            />
          </YGroup.Item>
        </YGroup>
        <Button backgroundColor="$red10" onPress={() => setConfirmDelete(true)}>
          {i18n.t("deleteAccount")}
        </Button>
        {confirmDelete && (
          <XStack flexGrow={1} justifyContent="center">
            <Button
              backgroundColor="$red10"
              onPress={async () => {
                if (!auth.currentUser) return;
                const res = await (
                  await client()
                ).api.users[":id"].$delete({
                  param: { id: auth.currentUser?.uid },
                });
                if (!res.ok) return;
                signOut(getAuth());
              }}
            >
              {i18n.t("deleteAccount")}
            </Button>
            <Button
              backgroundColor="$accentBackground"
              onPress={() => setConfirmDelete(false)}
            >
              {i18n.t("cancel")}
            </Button>
          </XStack>
        )}
      </YStack>
    </XStack>
  );
}
