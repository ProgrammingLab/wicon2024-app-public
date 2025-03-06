import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "@tamagui/lucide-icons";
import {
  ntripcasterSchema,
  sourcetableSchema,
} from "backend/src/schema/ntripcaster";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  H1,
  Input,
  Label,
  ListItem,
  Separator,
  SizableText,
  XStack,
  YGroup,
  YStack,
} from "tamagui";
import { z } from "zod";

import Select from "@/components/Select";
import { useAuthContext } from "@/context/auth";
import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

import { UpdateModal } from "./update";

export const NtripSettings = () => {
  const [refresh, setRefresh] = useState(false);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [selectedNtripcasterId, setSelectedNtripcasterId] = useState<
    number | null
  >(null);
  const [creation, setCreation] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ntripcasterPatchSchema = ntripcasterSchema.extend({
    id: z.number(),
  });
  const [ntripcasters, setNtripcasters] =
    useState<z.infer<typeof ntripcasterPatchSchema>[]>();
  type Sourcetable = z.infer<typeof sourcetableSchema>;
  const [sourcetable, setSourcetable] = useState<Sourcetable[] | undefined>();
  const [serverModalOpen, setServerModalOpen] = useState(false);
  const [serverError, setServerError] = useState("");
  const [portModalOpen, setPortModalOpen] = useState(false);
  const [portError, setPortError] = useState("");
  const [mountPointModalOpen, setMountPointModalOpen] = useState(false);
  const [mountPointError, setMountPointError] = useState("");
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const auth = useAuthContext();
  useEffect(() => {
    if (!auth) return;
    const fetch = async () => {
      if (!auth.currentUser) return;
      const groupsRes = await (
        await client()
      ).api.users[":id"].groups.$get({ param: { id: auth.currentUser?.uid } });
      if (!groupsRes.ok) return;
      const groupsJson = await groupsRes.json();
      if (!groupsJson) return;
      setGroupId(groupsJson[0].groupId);
      const res = await (
        await client()
      ).api.ntripcasters.$get({
        param: { id: groupsJson[0].groupId.toString() },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (!json) return;
      setNtripcasters(json);
    };
    fetch();
    setRefresh(false);
  }, [auth, refresh]);

  useEffect(() => {
    setSourcetable(undefined);
    const fetch = async () => {
      if (!ntripcasters || selectedNtripcasterId === null) return;
      if (!groupId) return;
      const res = await (
        await client()
      ).api.ntripcasters.mountpoints.$get({
        query: {
          host: ntripcasters.filter((n) => n.id === selectedNtripcasterId)[0]
            .host,
          port: ntripcasters
            .filter((n) => n.id === selectedNtripcasterId)[0]
            .port.toString(),
        },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (!json) return;
      setSourcetable(json);
    };
    fetch();
  }, [ntripcasters, selectedNtripcasterId]);

  /*
  For creation
  */
  const formSchema = ntripcasterSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    groupId: true,
  });
  const [creationError, setCreationError] = useState("");
  const [creationMountpoint, setCreationMountpoint] = useState<
    string[] | undefined
  >();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
    watch,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    setCreationMountpoint(undefined);
    const get = async () => {
      if (!getValues("host") || !getValues("port")) return;
      if (!groupId) return;
      const res = await (
        await client()
      ).api.ntripcasters.mountpoints.$get({
        query: { host: getValues("host"), port: getValues("port").toString() },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (!json) return;
      setCreationMountpoint(json.map((val: Sourcetable) => val.mountpoint));
    };
    get();
  }, [watch("host"), watch("port")]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const post = async () => {
      if (!groupId) return;
      const res = await (
        await client()
      ).api.ntripcasters.$post({
        json: { ...data, groupId: groupId },
      });
      if (!res.ok) {
        setCreationError(i18n.t("network-request-failed"));
      } else {
        setCreation(false);
        setCreationError("");
        reset();
      }
    };
    post();
    setRefresh(true);
  };

  return (
    <>
      <YStack gap="$2" width="100%">
        <H1>{i18n.t("ntripSettings")}</H1>
        <Separator alignSelf="stretch" borderColor={"$color"} />
        {selectedNtripcasterId !== null && ntripcasters ? (
          <>
            <XStack gap="$5">
              <Button
                backgroundColor="$accentBackground"
                onPress={() => setSelectedNtripcasterId(null)}
              >
                {i18n.t("return")}
              </Button>
              <Button
                backgroundColor="$accentBackground"
                onPress={async () => {
                  if (!groupId) return;
                  try {
                    await (
                      await client()
                    ).api.ntripcasters[":id"].$delete({
                      param: {
                        id: ntripcasters.filter(
                          (n) => n.id === selectedNtripcasterId,
                        )[0].id,
                      },
                    });
                    setSelectedNtripcasterId(null);
                    setRefresh(true);
                  } catch {
                    // TODO: Show error message
                    console.log("Failed to delete ntripcaster");
                  }
                }}
              >
                {i18n.t("delete")}
              </Button>
            </XStack>
            {/* Settings options */}
            <YGroup
              alignSelf="center"
              bordered
              width="100%"
              size="$5"
              separator={<Separator />}
            >
              {/* Server*/}
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  pressTheme
                  title={i18n.t("server")}
                  iconAfter={
                    <>
                      <SizableText size="$5">
                        {
                          ntripcasters.filter(
                            (n) => n.id === selectedNtripcasterId,
                          )[0].host
                        }
                      </SizableText>
                      <ChevronRight />
                    </>
                  }
                  size={"$5"}
                  onPress={() => setServerModalOpen(true)}
                />
              </YGroup.Item>
              <UpdateModal
                type="input"
                label={i18n.t("server")}
                open={serverModalOpen}
                value={
                  ntripcasters.filter((n) => n.id === selectedNtripcasterId)[0]
                    .host
                }
                schema={ntripcasterSchema.shape.host}
                submitFunc={async (val) => {
                  try {
                    const res = await (
                      await client()
                    ).api.ntripcasters[":id"].$patch({
                      param: {
                        id: ntripcasters.filter(
                          (n) => n.id === selectedNtripcasterId,
                        )[0].id,
                      },
                      json: { host: val },
                    });
                    if (!res.ok) {
                      setServerError(i18n.t("network-request-failed"));
                      return;
                    }
                    setServerModalOpen(false);
                    setRefresh(true);
                  } catch {
                    setServerError(i18n.t("network-request-failed"));
                  }
                }}
                errorMessage={serverError}
                closeModal={() => {
                  setServerModalOpen(false);
                  setServerError("");
                }}
              />

              {/* Port */}
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  pressTheme
                  title={i18n.t("port")}
                  iconAfter={
                    <>
                      <SizableText size="$5">
                        {
                          ntripcasters.filter(
                            (n) => n.id === selectedNtripcasterId,
                          )[0].port
                        }
                      </SizableText>
                      <ChevronRight />
                    </>
                  }
                  size={"$5"}
                  onPress={() => setPortModalOpen(true)}
                />
              </YGroup.Item>
              <UpdateModal
                type="input"
                label={i18n.t("port")}
                open={portModalOpen}
                value={
                  ntripcasters.filter((n) => n.id === selectedNtripcasterId)[0]
                    .port
                }
                schema={ntripcasterSchema.shape.port}
                submitFunc={async (val) => {
                  try {
                    const res = await (
                      await client()
                    ).api.ntripcasters[":id"].$patch({
                      param: {
                        id: ntripcasters.filter(
                          (n) => n.id === selectedNtripcasterId,
                        )[0].id,
                      },
                      json: { port: parseInt(val) },
                    });
                    if (!res.ok) {
                      setPortError(i18n.t("network-request-failed"));
                      return;
                    }
                    setPortModalOpen(false);
                    setRefresh(true);
                  } catch {
                    setPortError(i18n.t("network-request-failed"));
                  }
                }}
                errorMessage={portError}
                closeModal={() => {
                  setPortModalOpen(false);
                  setPortError("");
                }}
              />

              {/* マウントポイント (Select)*/}
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  pressTheme
                  title={i18n.t("mountPoint")}
                  size={"$5"}
                  iconAfter={
                    <>
                      <SizableText size="$5">
                        {
                          ntripcasters.filter(
                            (n) => n.id === selectedNtripcasterId,
                          )[0].mountpoint
                        }
                      </SizableText>
                      <ChevronRight />
                    </>
                  }
                  onPress={() => setMountPointModalOpen(true)}
                />
              </YGroup.Item>
              <UpdateModal
                type="select"
                label={i18n.t("mountPoint")}
                open={mountPointModalOpen}
                value={
                  ntripcasters.filter((n) => n.id === selectedNtripcasterId)[0]
                    .mountpoint
                }
                schema={ntripcasterSchema.shape.mountpoint}
                options={
                  sourcetable
                    ? sourcetable.map((line) => {
                        return {
                          label: line.mountpoint,
                          value: line.mountpoint,
                        };
                      })
                    : [{ label: "", value: "" }]
                }
                submitFunc={async (val) => {
                  try {
                    const res = await (
                      await client()
                    ).api.ntripcasters[":id"].$patch({
                      param: {
                        id: ntripcasters.filter(
                          (n) => n.id === selectedNtripcasterId,
                        )[0].id,
                      },
                      json: { mountpoint: val },
                    });
                    if (!res.ok) {
                      setMountPointError(i18n.t("network-request-failed"));
                      return;
                    }
                    setMountPointModalOpen(false);
                    setRefresh(true);
                  } catch {
                    setMountPointError(i18n.t("network-request-failed"));
                  }
                }}
                errorMessage={mountPointError}
                closeModal={() => {
                  setMountPointModalOpen(false);
                  setMountPointError("");
                }}
              />
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  pressTheme
                  title={i18n.t("username")}
                  iconAfter={
                    <>
                      <SizableText size="$5">
                        {
                          ntripcasters.filter(
                            (n) => n.id === selectedNtripcasterId,
                          )[0].username
                        }
                      </SizableText>
                      <ChevronRight />
                    </>
                  }
                  size={"$5"}
                  onPress={() => setUsernameModalOpen(true)}
                />
              </YGroup.Item>
              <UpdateModal
                type="input"
                label={i18n.t("username")}
                open={usernameModalOpen}
                value={
                  ntripcasters.filter((n) => n.id === selectedNtripcasterId)[0]
                    .username || ""
                }
                schema={ntripcasterSchema.required().shape.username}
                submitFunc={async (val) => {
                  try {
                    const res = await (
                      await client()
                    ).api.ntripcasters[":id"].$patch({
                      param: {
                        id: ntripcasters.filter(
                          (n) => n.id === selectedNtripcasterId,
                        )[0].id,
                      },
                      json: { username: val },
                    });
                    if (!res.ok) {
                      setUsernameError(i18n.t("network-request-failed"));
                      return;
                    }
                    setUsernameModalOpen(false);
                    setRefresh(true);
                  } catch {
                    setUsernameError(i18n.t("network-request-failed"));
                  }
                }}
                errorMessage={usernameError}
                closeModal={() => {
                  setUsernameModalOpen(false);
                  setUsernameError("");
                }}
              />
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  pressTheme
                  title={i18n.t("password")}
                  iconAfter={
                    <>
                      <SizableText size="$5">
                        {
                          ntripcasters.filter(
                            (n) => n.id === selectedNtripcasterId,
                          )[0].password
                        }
                      </SizableText>
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
                  value={
                    ntripcasters.filter(
                      (n) => n.id === selectedNtripcasterId,
                    )[0].password || ""
                  }
                  schema={ntripcasterSchema.required().shape.password}
                  submitFunc={async (val) => {
                    try {
                      const res = await (
                        await client()
                      ).api.ntripcasters[":id"].$patch({
                        param: {
                          id: ntripcasters.filter(
                            (n) => n.id === selectedNtripcasterId,
                          )[0].id,
                        },
                        json: { password: val },
                      });
                      if (!res.ok) {
                        setPasswordError(i18n.t("network-request-failed"));
                        return;
                      }
                      setPasswordModalOpen(false);
                      setRefresh(true);
                    } catch {
                      setPasswordError(i18n.t("network-request-failed"));
                    }
                  }}
                  errorMessage={passwordError}
                  closeModal={() => {
                    setPasswordModalOpen(false);
                    setPasswordError("");
                  }}
                />
              </YGroup.Item>
            </YGroup>
          </>
        ) : creation ? (
          <YStack padding="$3" backgroundColor="$background">
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
              <SizableText size="$2" color="red">
                {errors.name.message}
              </SizableText>
            )}
            <Label>{i18n.t("server")}</Label>
            <Controller
              name="host"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input value={field.value} onChangeText={field.onChange} />
              )}
            />
            {errors.host && (
              <SizableText size="$2" color="red">
                {errors.host.message}
              </SizableText>
            )}
            <Label>{i18n.t("port")}</Label>
            <Controller
              name="port"
              control={control}
              defaultValue={2101}
              render={({ field }) => (
                <Input
                  value={field.value.toString()}
                  onChangeText={(val) => field.onChange(parseInt(val))}
                />
              )}
            />
            {errors.port && (
              <SizableText size="$2" color="red">
                {errors.port.message}
              </SizableText>
            )}
            <Label>{i18n.t("mountPoint")}</Label>
            <Controller
              name="mountpoint"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select
                  selectedValue={field.value}
                  options={
                    creationMountpoint
                      ? creationMountpoint.map((val) => ({
                          label: val,
                          value: val,
                        }))
                      : [{ label: "", value: "" }]
                  }
                  onValueChange={field.onChange}
                />
              )}
            />
            <Label>{i18n.t("username")}</Label>
            <Controller
              name="username"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  value={field.value || ""}
                  onChangeText={field.onChange}
                />
              )}
            />
            {errors.username && (
              <SizableText size="$2" color="red">
                {errors.username.message}
              </SizableText>
            )}
            <Label>{i18n.t("password")}</Label>
            <Controller
              name="password"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  value={field.value || ""}
                  onChangeText={field.onChange}
                />
              )}
            />
            {errors.password && (
              <SizableText size="$2" color="red">
                {errors.password.message}
              </SizableText>
            )}
            {creationError && (
              <SizableText size="$2" color="red">
                {creationError}
              </SizableText>
            )}
            <XStack justifyContent="center" gap="$4">
              <Button
                backgroundColor="$accentBackground"
                onPress={() => {
                  setCreation(false);
                  setCreationError("");
                  reset();
                }}
              >
                {i18n.t("cancel")}
              </Button>
              <Button
                backgroundColor="$accentBackground"
                onPress={handleSubmit(onSubmit)}
              >
                {i18n.t("add")}
              </Button>
            </XStack>
          </YStack>
        ) : (
          <YStack>
            <XStack>
              <Button
                backgroundColor="$accentBackground"
                onPress={() => setCreation(true)}
              >
                {i18n.t("add")}
              </Button>
            </XStack>
            <YGroup>
              <YGroup.Item>
                {ntripcasters?.map((ntripcaster) => (
                  <ListItem
                    key={ntripcaster.id}
                    hoverTheme
                    pressTheme
                    title={ntripcaster.name}
                    iconAfter={
                      <>
                        <ChevronRight />
                      </>
                    }
                    size={"$5"}
                    onPress={() => setSelectedNtripcasterId(ntripcaster.id)}
                  />
                ))}
              </YGroup.Item>
            </YGroup>
          </YStack>
        )}
      </YStack>
    </>
  );
};
