/* eslint-disable @typescript-eslint/no-unused-vars */

/*
  作目（自動入力）（クエリパラメータで取得）
  圃場（自動入力）（クエリパラメータで取得）
  圃場面積（自動入力）（diaryPackで取得）
  DiaryType
  作業日時
  作業内容
  作業者
  農薬（農薬名/散布量）
  肥料（肥料名/使用量）

*/
import {
  ArrowDownRightFromSquare,
  CalendarClock,
  Carrot,
  ChevronLeft,
  ChevronRight,
  ClipboardPen,
  Columns3,
  FileType,
  NotepadText,
  ReceiptText,
  Shovel,
  SprayCan,
  TestTube,
  UserSquare,
  X,
} from "@tamagui/lucide-icons";
import { cropSchema } from "backend/src/schema/crop";
import { diaryResponseSchema } from "backend/src/schema/diary";
import { diarySchema } from "backend/src/schema/diary";
import { diaryPackSchema } from "backend/src/schema/diaryPack";
import { fieldSchema } from "backend/src/schema/field";
import { taskResponseSchema } from "backend/src/schema/task";
import { userSchema } from "backend/src/schema/user";
import { weatherResponseSchema } from "backend/src/schema/weather";
import dayjs from "dayjs";
import japan from "dayjs/locale/ja";
import { Link, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { ja, registerTranslation } from "react-native-paper-dates";

import { useAuthContext } from "@/context/auth";
dayjs.locale(japan);
registerTranslation("ja", ja);

import { groupResponseSchema } from "backend/src/schema/group";
import { router } from "expo-router";
import { Controller, set, SubmitHandler, useForm } from "react-hook-form";
import {
  Button,
  Card,
  H1,
  Input,
  Label,
  ListItem,
  ScrollView,
  Separator,
  SizableText,
  Switch,
  Text,
  XStack,
  YGroup,
  YStack,
} from "tamagui";
import { z } from "zod";

import Select from "@/components/Select";
import { fertPestApiClient } from "@/lib/fertPestApi";
import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

import { UpdateModal } from "../../../components/diaries/update";

//APIから取得するデータの型
interface Fertilizer {
  登録番号: string;
  登録年月日: string;
  肥料の名称: string;
  成分コード1: string;
  保証成分量1: number;
  成分コード2: string;
  保証成分量2: number;
  成分コード3: string;
  保証成分量3: number;
  成分コード4: string;
  保証成分量4: number;
  成分コード5?: string;
  保証成分量5?: number | string;
  成分コード6?: string;
  保証成分量6?: number | string;
  成分コード7?: string;
  保証成分量7?: number | string;
  成分コード8?: string;
  保証成分量8?: number | string;
  成分コード9?: string;
  保証成分量9?: number | string;
  成分コード10?: string;
  保証成分量10?: number | string;
  成分コード11?: string;
  保証成分量11?: number | string;
  成分コード12?: string;
  保証成分量12?: number | string;
  成分コード13?: string;
  保証成分量13?: number | string;
  成分コード14?: string;
  保証成分量14?: number | string;
  成分コード15?: string;
  保証成分量15?: number | string;
  成分コード16?: string;
  保証成分量16?: number | string;
  肥料業者: string;
  住所: string;
  肥料種類名称: string;
  失効区分: string;
}

interface Pesticide {
  剤型名: string;
  有効成分: string;
  正式名称: string;
  混合数: number;
  濃度: string;
  用途: string;
  登録年月日: string;
  登録番号: number;
  総使用回数における有効成分: string;
  農薬の名称: string;
  農薬の種類: string;
}

export default function AddDiary() {
  // クエリパラメータから作目と圃場を取得
  const { pack } = useLocalSearchParams<{
    pack: string;
  }>();
  const packId = Number(pack);
  const auth = useAuthContext();

  const [selectedDiaryType, setSelectedDiaryType] = useState("schedule");
  const handleSwitchChange = (checked: boolean) => {
    setSelectedDiaryType(checked ? "schedule" : "record");
  };

  const [refresh, setRefresh] = useState(false);
  const [crops, setCrops] = useState<z.infer<typeof cropSchema>[]>([]);
  const [fields, setFields] = useState<z.infer<typeof fieldSchema>[]>([]);
  const [diaries, setDiaries] = useState<z.infer<typeof diaryResponseSchema>[]>(
    [],
  );
  const [diaryPacks, setDiaryPacks] = useState<
    z.infer<typeof diaryPackSchema>[]
  >([]);
  const [diaryTaskTypes, setDiaryTaskTypes] = useState<
    z.infer<typeof taskResponseSchema>[]
  >([]);
  const [harvestWeathers, setHarvestWeathers] = useState<
    z.infer<typeof weatherResponseSchema>[]
  >([]);
  const [usernameList, setUsernameList] = useState<
    z.infer<typeof groupResponseSchema>["users"]
  >([]);
  const [workingDayModalOpen, setWorkingDayModalOpen] = useState(false);

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await (await client()).api.diaries.crops.$get();
        if (!res.ok) return;
        const json = await res.json();
        if (!json) return;
        setCrops(json);
        const res2 = await (await client()).api.fields.$get();
        if (!res2.ok) return;
        const json2 = await res2.json();
        if (!json2) return;
        setFields(json2);
        const res3 = await (await client()).api.diaries.$get();
        if (!res3.ok) return;
        const json3 = await res3.json();
        if (!json3) return;
        setDiaries(json3);
        const res4 = await (await client()).api.diaries.tasks.$get();
        if (!res4.ok) return;
        const json4 = await res4.json();
        if (!json4) return;
        setDiaryTaskTypes(json4);
        const res5 = await (await client()).api.diaries.weathers.$get();
        if (!res5.ok) return;
        const json5 = await res5.json();
        if (!json5) return;
        setHarvestWeathers(json5);
        const res6 = await (await client()).api.diaryPacks.$get();
        if (!res6.ok) return;
        const json6 = await res6.json();
        if (!json6) return;
        setDiaryPacks(json6);
        const res7 = await (
          await client()
        ).api.groups[":id"].$get({
          param: {
            id: 1, //?todo
          },
        });
        if (!res7.ok) return;
        const json7 = await res7.json();
        if (!json7) return;
        setUsernameList(json7.users);
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
    setRefresh(false);
  }, [refresh]);

  //React Hook Form
  const DiaryType = {
    schedule: "schedule",
    record: "record",
  } as const;

  // Union型を生成
  type DiaryType = (typeof DiaryType)[keyof typeof DiaryType];
  type TaskTypes = z.infer<typeof taskResponseSchema>["id"];
  type Worker = z.infer<typeof groupResponseSchema.shape.users.element>["id"];
  type Weather = z.infer<typeof weatherResponseSchema>["id"];
  type Datetime = z.infer<typeof diarySchema>["datetime"];

  // フォームで使用する型を生成
  type FormData = {
    //固定
    selectedDiaryType: DiaryType; // DiaryType
    workingDatetime: Datetime; // 作業日時(modal)
    taskId: TaskTypes; // 作業内容(select)
    worker: Worker; // 作業者(select)
    // 農薬（農薬名/散布量）
    fertilizerInput: Fertilizer["登録番号"];
    fertilizerAmount?: number;
    // 肥料（肥料名/使用量）
    pesticideInput: Pesticide["登録番号"];
    pesticideAmount?: number;
    noteInput?: string; //memo
    weatherId?: Weather; //天気
  };

  // 初期値
  const defaultValues = {
    selectedDiaryType: DiaryType.schedule,
    workingDatetime: dayjs().format("YYYY-MM-DDTHH:mm:ssZ"),
    taskId: "",
    weatherId: "template-1",
    worker: "defaultworker",
    fertilizerInput: "",
    fertilizerAmount: 0,
    pesticideInput: 0,
    pesticideAmount: 0,
    noteInput: "",
  };

  // react hook from の初期設定
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({ defaultValues });
  // フォーム送信処理
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log("submit", data);
    try {
      const result = await (
        await client()
      ).api.diaries.$post({
        json: {
          groupId: 1,
          diaryPackId: packId,
          pesticideRegistrationNumber: data.pesticideInput || null,
          fertilizerRegistrationNumber: data.fertilizerInput || null,
          pesticideAmount: data.pesticideAmount ?? null,
          fertilizerAmount: data.fertilizerAmount ?? null,
          workerId: data.worker,
          registrerId: auth.currentUser?.uid ?? "", //登録者はログインしている垢
          weatherId: data.weatherId || "template-1",
          taskId: data.taskId,
          datetime: data.workingDatetime,
          type: data.selectedDiaryType,
          note: data.noteInput || "",
        },
      });
      console.log("Result:", result);
      if (!result.ok) {
        const errorData = await result.json();
        setErrorMessage(errorData.message || "エラーが発生しました");
        return;
      }

      // Success handling
      setErrorMessage(null);
      reset(defaultValues);
      setRefresh(true);
      setFertilizerSearch("");
      setPesticideSearch("");
      router.replace("/(tabs)/diaries");
    } catch (error) {
      setErrorMessage("ネットワークエラーが発生しました");
    }
  };

  // フォームリセット処理
  const handleReset = () => {
    reset(defaultValues);
    setFertilizerSearch("");
    setPesticideSearch("");
    setErrorMessage(null);
    //送信完了の演出
  };

  //農薬検索用:TODO
  const [pesticideSearch, setPesticideSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Pesticide[]>([]);
  const [pesticideAns, setPesticideAns] = useState("");

  useEffect(() => {
    const fetch = async () => {
      if (!pesticideSearch) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fertPestApiClient.pesticides.$get({
          query: { query: pesticideSearch },
        });

        if (!res.ok) return;

        const json = await res.json();
        setSuggestions(json);
        console.log("Suggestions:", suggestions);
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
  }, [pesticideSearch]);

  //肥料検索用:TODO
  const [fertilizerSearch, setFertilizerSearch] = useState("");
  const [fertilizerSuggestions, setFertilizerSuggestions] = useState<
    Fertilizer[]
  >([]);

  useEffect(() => {
    const fetch = async () => {
      if (!fertilizerSearch) {
        setFertilizerSuggestions([]);
        return;
      }
      try {
        const res = await fertPestApiClient.fertilizers.$get({
          query: { query: fertilizerSearch },
        });

        if (!res.ok) return;

        const json = await res.json();
        setFertilizerSuggestions(json);
        console.log("Suggestions:", fertilizerSuggestions);
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
  }, [fertilizerSearch]);

  return (
    <FlatList
      data={[{ key: "form" }]}
      renderItem={() => (
        <XStack padding="$3">
          <YStack gap="$4" width="100%">
            <XStack alignItems="center" gap="$2">
              <ClipboardPen size="$3" />
              <H1
                fontSize="$9"
                color="$primary"
                letterSpacing="$1"
                fontWeight="400"
              >
                {i18n.t("AddDiary")}
              </H1>
            </XStack>
            <Separator alignSelf="stretch" borderColor={"$color"} />
            <YGroup
              alignSelf="center"
              bordered
              width="100%"
              size="$5"
              separator={<Separator />}
            >
              {/* DiaryType (swich)*/}
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  title={
                    <XStack alignItems="center" gap="$4">
                      <FileType size="$3" strokeWidth={1.5} />
                      <Text fontSize="$8" fontWeight={400}>
                        {i18n.t("diariesType")}
                      </Text>
                    </XStack>
                  }
                  iconAfter={
                    <Controller
                      name="selectedDiaryType"
                      control={control}
                      render={({ field }) => (
                        <XStack gap="$4" alignItems="center">
                          <SizableText>{selectedDiaryType}</SizableText>
                          <Switch
                            size="$4"
                            alignSelf="center"
                            checked={field.value === DiaryType.schedule}
                            onCheckedChange={async (checked) => {
                              field.onChange(
                                checked ? DiaryType.schedule : DiaryType.record,
                              );
                              handleSwitchChange(checked);
                            }}
                          >
                            <Switch.Thumb
                              animation="quicker"
                              backgroundColor={
                                field.value === DiaryType.schedule
                                  ? "#ADD8E6"
                                  : "#AAAAAA"
                              }
                            />
                          </Switch>
                        </XStack>
                      )}
                    />
                  }
                />
              </YGroup.Item>
              {/* 作目（自動入力）（クエリパラメータで取得） (固定)*/}
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  title={
                    <XStack alignItems="center" gap="$4">
                      <Carrot size="$3" strokeWidth={1.5} />
                      <Text fontSize="$8" fontWeight={400}>
                        {i18n.t("crops")}
                      </Text>
                    </XStack>
                  }
                  iconAfter={
                    <>
                      <SizableText>
                        {
                          crops.find(
                            (crop) =>
                              crop.id ===
                              diaryPacks.find((diary) => diary.id === packId)
                                ?.cropId,
                          )?.name
                        }
                      </SizableText>
                    </>
                  }
                  size="$5"
                />
              </YGroup.Item>
              {/* 圃場（自動入力）（クエリパラメータで取得） (固定)*/}
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  title={
                    <XStack alignItems="center" gap="$4">
                      <Columns3 size="$3" strokeWidth={1.5} />
                      <Text fontSize="$8" fontWeight={400}>
                        {i18n.t("fields")}
                      </Text>
                    </XStack>
                  }
                  iconAfter={
                    <>
                      <SizableText>
                        {
                          fields.find(
                            (field) =>
                              field.id ===
                              diaryPacks.find((diary) => diary.id === packId)
                                ?.fieldId,
                          )?.name
                        }
                      </SizableText>
                    </>
                  }
                  size="$5"
                />
              </YGroup.Item>
              {/* 圃場面積（自動入力）(diaryPackで取得) (固定)*/}
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  title={
                    <XStack alignItems="center" gap="$4">
                      <ArrowDownRightFromSquare size="$3" strokeWidth={1.5} />
                      <Text fontSize="$8" fontWeight={400}>
                        {i18n.t("fieldArea")}
                      </Text>
                    </XStack>
                  }
                  iconAfter={
                    <>
                      <SizableText>
                        {fields
                          .find(
                            (field) =>
                              field.id ===
                              diaryPacks.find((diary) => diary.id === packId)
                                ?.fieldId,
                          )
                          ?.area?.toString()}
                      </SizableText>
                    </>
                  }
                  size="$5"
                />
              </YGroup.Item>
              {/* 作業日時 (modal)*/}
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  pressTheme
                  title={
                    <XStack alignItems="center" gap="$4">
                      <CalendarClock size="$3" strokeWidth={1.5} />
                      <Text fontSize="$8" fontWeight={400}>
                        {i18n.t("workingDate")}
                      </Text>
                    </XStack>
                  }
                  iconAfter={
                    <XStack gap="$4">
                      <Controller
                        name="workingDatetime"
                        control={control}
                        render={({
                          field: { onChange, value },
                          fieldState,
                        }) => (
                          <YStack gap="$2">
                            <SizableText>
                              {/* TODO:表示されている日時がおかしい */}
                              {value
                                ? dayjs(value)
                                    .locale(japan)
                                    .format("YYYY-MM-DD-HH:mm")
                                : ""}
                            </SizableText>
                            <UpdateModal
                              type="date"
                              label={i18n.t("workingDate")}
                              open={workingDayModalOpen}
                              value={value}
                              schema={diaryResponseSchema.shape.datetime}
                              closeModal={() => setWorkingDayModalOpen(false)}
                              submitFunc={(selectedDate) => {
                                console.log("Selected value:", selectedDate);
                                if (selectedDate) {
                                  onChange(selectedDate);
                                  setWorkingDayModalOpen(false);
                                  setRefresh(true);
                                }
                              }}
                            />
                            {fieldState.error && (
                              <Text color="$red10">
                                {fieldState.error.message}
                              </Text>
                            )}
                          </YStack>
                        )}
                      />
                      <ChevronRight />
                    </XStack>
                  }
                  size="$5"
                  onPress={() => setWorkingDayModalOpen(true)}
                />
              </YGroup.Item>
              {/* 作業内容 (select)*/}
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  title={
                    <XStack alignItems="center" gap="$4">
                      <Shovel size="$3" strokeWidth={1.5} />
                      <Text fontSize="$8" fontWeight={400}>
                        {i18n.t("workContent")}
                      </Text>
                    </XStack>
                  }
                  iconAfter={
                    <XStack width="$20">
                      <Controller
                        name="taskId"
                        rules={{ required: "必須項目です" }}
                        control={control}
                        render={({
                          field: { onChange, value },
                          fieldState,
                        }) => {
                          return (
                            <YStack width="$20">
                              <Select
                                options={diaryTaskTypes.map((task) => ({
                                  label: task.name,
                                  value: task.id,
                                }))}
                                selectedValue={value}
                                onValueChange={(
                                  selectedValue: string | number,
                                ) => {
                                  onChange(selectedValue);
                                }}
                              />
                              {fieldState.error && (
                                <Text color="red" fontSize={12}>
                                  {fieldState.error.message}
                                </Text>
                              )}
                            </YStack>
                          );
                        }}
                      />
                    </XStack>
                  }
                  size="$5"
                />
              </YGroup.Item>
              {/* 作業者 (select)*/}
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  title={
                    <XStack alignItems="center" gap="$4">
                      <UserSquare size="$3" strokeWidth={1.5} />
                      <Text fontSize="$8" fontWeight={400}>
                        {i18n.t("worker")}
                      </Text>
                    </XStack>
                  }
                  iconAfter={
                    <XStack width="$20">
                      <Controller
                        name="worker"
                        rules={{ required: "必須項目です" }}
                        control={control}
                        render={({
                          field: { onChange, value },
                          fieldState,
                        }) => {
                          return (
                            <YStack width="$20">
                              <Select
                                options={usernameList.map((worker) => ({
                                  label: worker.name,
                                  value: worker.id,
                                }))}
                                selectedValue={value}
                                onValueChange={(
                                  selectedValue: string | number,
                                ) => {
                                  onChange(selectedValue);
                                }}
                              />
                              {fieldState.error && (
                                <Text color="red" fontSize={12}>
                                  {fieldState.error.message}
                                </Text>
                              )}
                            </YStack>
                          );
                        }}
                      />
                    </XStack>
                  }
                  size="$5"
                />
              </YGroup.Item>
              {/* 農薬（農薬名/散布量） */}
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  title={
                    <XStack alignItems="center" gap="$4">
                      <SprayCan size="$3" strokeWidth={1.5} />
                      <Text fontSize="$8" fontWeight={400}>
                        {i18n.t("pesticides")}
                      </Text>
                    </XStack>
                  }
                  iconAfter={
                    <YStack alignItems="flex-end" gap="$4" width="$10">
                      <Controller
                        name="pesticideInput"
                        control={control}
                        render={({ field, fieldState }) => (
                          <YStack gap="$2">
                            <XStack gap="$2">
                              {/* <Text>{pesticideAns}</Text> */}
                              {/* 候補リストの表示 */}
                              {suggestions.length > 0 && (
                                <FlatList
                                  data={suggestions}
                                  keyExtractor={(item, index) =>
                                    `${item.登録番号}-${index}`
                                  }
                                  renderItem={({ item }) => (
                                    <TouchableOpacity
                                      onPress={() => {
                                        setPesticideSearch(
                                          item.登録番号.toString(),
                                        );
                                        setSuggestions([]);
                                        field.onChange(item.登録番号);
                                        setPesticideAns(item.農薬の名称);
                                      }}
                                    >
                                      <ListItem>{item.農薬の名称}</ListItem>
                                    </TouchableOpacity>
                                  )}
                                />
                              )}
                              <Input
                                width="$20"
                                borderWidth="$1"
                                placeholder={"農薬登録番号"}
                                id={`pesticideInput-${field.name}`}
                                value={field.value?.toString()}
                                onChangeText={(value) => {
                                  if (!/^[0-9]+/.test(value)) field.onChange(0);
                                  else {
                                    field.onChange(Number(value));
                                    setPesticideSearch(value);
                                  }
                                }}
                                onBlur={field.onBlur}
                              />
                            </XStack>
                            {fieldState.error && (
                              <Text color="$red10">
                                {fieldState.error.message}
                              </Text>
                            )}
                          </YStack>
                        )}
                      />
                      <Controller
                        name="pesticideAmount"
                        control={control}
                        render={({ field, fieldState }) => (
                          <YStack space="$2">
                            <XStack gap="$3" alignItems="center" width="$20">
                              <Input
                                width="90%"
                                borderWidth="$1"
                                placeholder={"農薬散布量"}
                                id={`pesticideAmount-${field.name}`}
                                value={
                                  field.value === 0
                                    ? ""
                                    : field.value?.toString()
                                }
                                onChangeText={(value) => {
                                  if (!/^[0-9]+/.test(value)) field.onChange(0);
                                  else field.onChange(Number(value));
                                }}
                                onBlur={field.onBlur}
                              />
                              {fieldState.error && (
                                <Text color="$red10">
                                  {fieldState.error.message}
                                </Text>
                              )}
                              <Text>L</Text>
                            </XStack>
                          </YStack>
                        )}
                      />
                    </YStack>
                  }
                  size="$5"
                />
              </YGroup.Item>
              {/* 天気 */}
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  title={
                    <XStack alignItems="center" gap="$4">
                      <Shovel size="$3" strokeWidth={1.5} />
                      <Text fontSize="$8" fontWeight={400}>
                        {i18n.t("weathers")}
                      </Text>
                    </XStack>
                  }
                  iconAfter={
                    <XStack width="$20">
                      <Controller
                        name="weatherId"
                        control={control}
                        render={({
                          field: { onChange, value },
                          fieldState,
                        }) => {
                          return (
                            <YStack width="$20">
                              <Select
                                options={harvestWeathers.map((weather) => ({
                                  label: weather.name,
                                  value: weather.id,
                                }))}
                                selectedValue={value}
                                onValueChange={(
                                  selectedValue: string | number,
                                ) => {
                                  onChange(selectedValue);
                                }}
                              />
                            </YStack>
                          );
                        }}
                      />
                    </XStack>
                  }
                  size="$5"
                />
              </YGroup.Item>
              {/* メモ */}
              <YGroup.Item>
                <Card gap="$4" padding="$5">
                  <XStack alignItems="center" justifyContent="space-between">
                    {/* title */}
                    <XStack alignItems="center" gap="$4">
                      <NotepadText size="$3" strokeWidth={1.5} />
                      <Text fontSize="$8" fontWeight={400}>
                        {i18n.t("memo")}
                      </Text>
                    </XStack>
                    {/* iconAfter */}
                    <YStack alignItems="center" gap="$4" width="$20">
                      <Controller
                        name="noteInput"
                        control={control}
                        render={({ field, fieldState }) => (
                          <YStack space="$2">
                            <Input
                              width="$20"
                              borderWidth="$1"
                              placeholder={i18n.t("memo")}
                              id={`note-${field.name}`}
                              value={field.value}
                              onChangeText={field.onChange}
                              onBlur={field.onBlur}
                            />
                            {fieldState.error && (
                              <Text color="$red10">
                                {fieldState.error.message}
                              </Text>
                            )}
                          </YStack>
                        )}
                      />
                    </YStack>
                  </XStack>
                </Card>
              </YGroup.Item>
            </YGroup>
            {/* 送信&リセット */}
            <YStack alignItems="center" gap="$2">
              <Text color="$red10">{errorMessage}</Text>
              <XStack alignItems="center" gap="$2" padding="$2">
                <Card
                  bordered
                  alignItems="center"
                  padding="$4"
                  width="50%"
                  pressStyle={{ scale: 0.97 }}
                  themeInverse
                  onPress={handleSubmit(onSubmit)}
                >
                  <Text>{i18n.t("submit")}</Text>
                </Card>
                <Card
                  bordered
                  alignItems="center"
                  padding="$4"
                  width="50%"
                  pressStyle={{ scale: 0.97 }}
                  onPress={handleReset}
                >
                  <Text>{i18n.t("reset")}</Text>
                </Card>
              </XStack>
              {/* 戻る */}
              <Link href="/(tabs)/diaries" asChild>
                <Card
                  bordered
                  alignItems="center"
                  padding="$4"
                  width="30%"
                  pressStyle={{ scale: 0.97 }}
                >
                  <XStack alignItems="center">
                    <ChevronLeft size={24} color="$color" />
                    <YStack>
                      <Text fontWeight="bold" fontSize="$7">
                        {i18n.t("return")}
                      </Text>
                    </YStack>
                  </XStack>
                </Card>
              </Link>
            </YStack>
          </YStack>
        </XStack>
      )}
    />
  );
}
