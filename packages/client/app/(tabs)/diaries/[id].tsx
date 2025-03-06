import {
  CalendarClock,
  Carrot,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CloudSunRain,
  Columns3,
  FileType,
  Shovel,
  SprayCan,
  StickyNote,
} from "@tamagui/lucide-icons";
import { cropSchema } from "backend/src/schema/crop";
import { diaryResponseSchema } from "backend/src/schema/diary";
import { fieldSchema } from "backend/src/schema/field";
import { taskResponseSchema } from "backend/src/schema/task";
import { weatherResponseSchema } from "backend/src/schema/weather";
import dayjs from "dayjs";
import japan from "dayjs/locale/ja";
import { Link, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Card,
  H1,
  ListItem,
  Separator,
  SizableText,
  Text,
  XStack,
  YGroup,
  YStack,
} from "tamagui";
import { z } from "zod";
dayjs.locale(japan);

import { diaryPackSchema } from "backend/src/schema/diaryPack";

import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

import { UpdateModal } from "../../../components/diaries/update";

export default function ShowDiary() {
  //URL受け取り
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const diaryId = parseInt(id, 10);

  if (isNaN(diaryId)) {
    console.error("Invalid diary ID");
    return null;
  }

  const [refresh, setRefresh] = useState(false);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [diaryTypeModalOpen, setDiaryTypeModalOpen] = useState(false);
  const [workingDayModalOpen, setWorkingDayModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [weatherModalOpen, setWeatherModalOpen] = useState(false);
  const [memoModalOpen, setMemoModalOpen] = useState(false);

  const [cropError, setCropError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [diaryTypeError, setDiaryTypeError] = useState("");
  const [workingDayError, setWorkingDayError] = useState("");
  const [taskError, setTaskError] = useState("");
  const [harvestWeatherError, setHarvestWeatherError] = useState("");
  const [memoError, setMemoError] = useState("");

  //API
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

  const [pesticideModalOpen, setPesticideModalOpen] = useState(false);
  const [pesticideError, setPesticideError] = useState("");

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
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
    setRefresh(false);
  }, [refresh]);

  return (
    <XStack padding="$2">
      <YStack gap="$4" width="100%">
        <XStack alignItems="center" gap="$2">
          <ClipboardList size="$3" />
          <H1
            fontSize="$9"
            color="$primary"
            letterSpacing="$1"
            fontWeight="400"
          >
            {i18n.t("diaries")}
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
          {/* 作付 */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
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
                          diaryPacks.find((diaryPack) =>
                            diaries.some(
                              (diary) =>
                                diary.id === diaryId &&
                                diaryPack.id === diary.diaryPackId,
                            ),
                          )?.cropId,
                      )?.name
                    }
                  </SizableText>
                  <ChevronRight />
                </>
              }
              size="$5"
              onPress={() => {
                setCropModalOpen(true);
              }}
            />
            <UpdateModal
              type="select"
              label={i18n.t("crops")}
              open={cropModalOpen}
              options={
                crops
                  ? crops.map((crop) => ({
                      label: crop.name,
                      value: crop.id,
                    }))
                  : [{ label: "", value: 0 }]
              }
              value={
                diaryPacks.find((diary) => diary.id === diaryId)?.cropId ?? 0
              }
              schema={diaryPackSchema.shape.cropId}
              submitFunc={async (val) => {
                try {
                  const res = await (
                    await client()
                  ).api.diaryPacks[":id"].$patch({
                    param: {
                      id: diaryId, //TODO:型変換?
                    },
                    json: { cropId: Number(val) },
                  });
                  if (!res.ok) {
                    setCropError(i18n.t("network-request-failed"));
                    return;
                  }
                  setCropModalOpen(false);
                  setRefresh(true);
                } catch {
                  setCropError(i18n.t("network-request-failed"));
                }
              }}
              errorMessage={cropError}
              closeModal={() => {
                setCropModalOpen(false);
                setCropError("");
              }}
            />
          </YGroup.Item>
          {/* 圃場 */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
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
                          diaryPacks.find((diaryPack) =>
                            diaries.some(
                              (diary) =>
                                diary.id === diaryId &&
                                diaryPack.id === diary.diaryPackId,
                            ),
                          )?.fieldId,
                      )?.name
                    }
                  </SizableText>
                  <ChevronRight />
                </>
              }
              size="$5"
              onPress={() => setFieldModalOpen(true)}
            />
            <UpdateModal
              type="select"
              label={i18n.t("fields")}
              open={fieldModalOpen}
              options={
                fields
                  ? fields.map((field) => ({
                      label: field.name,
                      value: field.id,
                    }))
                  : [{ label: "", value: 0 }]
              }
              value={
                diaryPacks.find((diary) => diary.id === diaryId)?.fieldId ?? 0
              }
              schema={diaryPackSchema.shape.fieldId}
              submitFunc={async (val) => {
                try {
                  const res = await (
                    await client()
                  ).api.diaryPacks[":id"].$patch({
                    param: {
                      id: diaryId,
                    },
                    json: { fieldId: Number(val) },
                  });
                  if (!res.ok) {
                    setFieldError(i18n.t("network-request-failed"));
                    return;
                  }
                  setFieldModalOpen(false);
                  setRefresh(true);
                } catch {
                  setFieldError(i18n.t("network-request-failed"));
                }
              }}
              errorMessage={fieldError}
              closeModal={() => {
                setFieldModalOpen(false);
                setFieldError("");
              }}
            />
          </YGroup.Item>
          {/* Diary Type (予定/記録) */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title={
                <XStack alignItems="center" gap="$4">
                  <FileType size="$3" strokeWidth={1.5} />
                  <Text fontSize="$8" fontWeight={400}>
                    {i18n.t("diariesType")}
                  </Text>
                </XStack>
              }
              iconAfter={
                <>
                  <SizableText>
                    {diaries.find((diary) => diary.id === diaryId)?.type}
                  </SizableText>
                  <ChevronRight />
                </>
              }
              size="$5"
              onPress={() => setDiaryTypeModalOpen(true)}
            />
            <UpdateModal
              type="select"
              label={i18n.t("diariesType")}
              open={diaryTypeModalOpen}
              options={[
                { label: i18n.t("record"), value: "record" },
                { label: i18n.t("schedule"), value: "schedule" },
              ]}
              value={diaries.find((diary) => diary.id === diaryId)?.type ?? ""}
              schema={z.enum(["record", "schedule"])} //TODO:?
              submitFunc={async (val: string | number) => {
                if (val !== "record" && val !== "schedule") {
                  return;
                }
                try {
                  const res = await (
                    await client()
                  ).api.diaries[":id"].$patch({
                    param: {
                      id: diaryId,
                    },
                    json: { type: val },
                  });
                  if (!res.ok) {
                    setDiaryTypeError(i18n.t("network-request-failed"));
                    return;
                  }
                  setDiaryTypeModalOpen(false);
                  setRefresh(true);
                } catch {
                  setDiaryTypeError(i18n.t("network-request-failed"));
                }
              }}
              errorMessage={diaryTypeError}
              closeModal={() => setDiaryTypeModalOpen(false)}
            />
          </YGroup.Item>
          {/* 作業日  */}
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
                <>
                  <SizableText>
                    {diaries.find((diary) => diary.id === diaryId)
                      ? dayjs(
                          diaries.find((diary) => diary.id === diaryId)
                            ?.datetime,
                        )
                          .locale(japan)
                          .format("YYYY-MM-DD-HH:mm")
                      : ""}
                  </SizableText>
                  <ChevronRight />
                </>
              }
              size="$5"
              onPress={() => setWorkingDayModalOpen(true)}
            />
            <UpdateModal
              type="date"
              label={i18n.t("workingDate")}
              open={workingDayModalOpen}
              value={
                diaries.find((diary) => diary.id === diaryId)?.datetime ?? ""
              }
              schema={diaryResponseSchema.shape.datetime}
              submitFunc={async (val) => {
                try {
                  const res = await (
                    await client()
                  ).api.diaries[":id"].$patch({
                    param: {
                      id: diaryId,
                    },
                    json: { datetime: val },
                  });
                  if (!res.ok) {
                    setWorkingDayError(i18n.t("network-request-failed"));
                    return;
                  }
                  setWorkingDayModalOpen(false);
                  setRefresh(true);
                } catch {
                  setWorkingDayError(i18n.t("network-request-failed"));
                }
              }}
              errorMessage={workingDayError}
              closeModal={() => {
                setWorkingDayModalOpen(false);
                setRefresh(true);
              }}
            />
          </YGroup.Item>
          {/* 作業 */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title={
                <XStack alignItems="center" gap="$4">
                  <Shovel size="$3" strokeWidth={1.5} />
                  <Text fontSize="$8" fontWeight={400}>
                    {i18n.t("workingContent")}
                  </Text>
                </XStack>
              }
              iconAfter={
                <>
                  <SizableText>
                    {
                      diaryTaskTypes.find(
                        (task) =>
                          task.id ===
                          diaries.find((diary) => diary.id === diaryId)?.taskId,
                      )?.name
                    }
                  </SizableText>
                  <ChevronRight />
                </>
              }
              size="$5"
              onPress={() => setTaskModalOpen(true)}
            />
            <UpdateModal
              type="select"
              label={i18n.t("workingContent")}
              open={taskModalOpen}
              options={
                diaryTaskTypes
                  ? diaryTaskTypes
                      //   .filter(
                      //     (type) =>
                      //       type.name ===
                      //       diaries.find((diary) => diary.id === diaryId)?.task,
                      //   )
                      .map((type) => ({
                        label: type.name,
                        value: type.id,
                      }))
                  : [{ label: "", value: 0 }]
              }
              value={diaries.find((diary) => diary.id === diaryId)?.taskId ?? 0}
              schema={diaryResponseSchema.shape.taskId}
              submitFunc={async (val) => {
                try {
                  const res = await (
                    await client()
                  ).api.diaries[":id"].$patch({
                    param: {
                      id: diaryId,
                    },
                    json: { taskId: String(val) },
                  });
                  if (!res.ok) {
                    setTaskError(i18n.t("network-request-failed"));
                    return;
                  }
                  setTaskModalOpen(false);
                  setRefresh(true);
                } catch {
                  setTaskError(i18n.t("network-request-failed"));
                }
              }}
              errorMessage={taskError}
              closeModal={() => {
                setTaskModalOpen(false);
                setTaskError("");
              }}
            />
          </YGroup.Item>
          {/* 農薬 */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title={
                <XStack alignItems="center" gap="$4">
                  <SprayCan size="$3" strokeWidth={1.5} />
                  <Text fontSize="$8" fontWeight={400}>
                    {i18n.t("pesticides")}
                  </Text>
                </XStack>
              }
              iconAfter={
                <>
                  <SizableText>
                    {
                      diaries.find((diary) => diary.id === diaryId)
                        ?.fertilizerRegistrationNumber
                    }
                  </SizableText>
                  <ChevronRight />
                </>
              }
              size="$5"
              onPress={() => setPesticideModalOpen(true)}
            />
            <UpdateModal
              type="input"
              label={i18n.t("pesticides")}
              open={pesticideModalOpen}
              value={
                diaries.find((diary) => diary.id === diaryId)
                  ?.fertilizerRegistrationNumber ?? ""
              }
              schema={diaryResponseSchema.shape.fertilizerRegistrationNumber}
              submitFunc={async (val) => {
                try {
                  const res = await (
                    await client()
                  ).api.diaries[":id"].$patch({
                    param: {
                      id: diaryId,
                    },
                    json: {
                      fertilizerRegistrationNumber: String(val),
                    },
                  });
                  if (!res.ok) {
                    setPesticideError(i18n.t("network-request-failed"));
                    return;
                  }
                  setPesticideModalOpen(false);
                  setRefresh(true);
                } catch {
                  setPesticideError(i18n.t("network-request-failed"));
                }
              }}
              errorMessage={pesticideError}
              closeModal={() => {
                setPesticideModalOpen(false);
                setPesticideError("");
              }}
            />
          </YGroup.Item>
          {/* 収穫天候  */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title={
                <XStack alignItems="center" gap="$4">
                  <CloudSunRain size="$3" strokeWidth={1.5} />
                  <Text fontSize="$8" fontWeight={400}>
                    {i18n.t("weathers")}
                  </Text>
                </XStack>
              }
              iconAfter={
                <>
                  <SizableText>
                    {
                      harvestWeathers.find(
                        (weather) =>
                          weather.id ===
                          diaries.find((diary) => diary.id === diaryId)
                            ?.weatherId,
                      )?.name
                    }
                  </SizableText>
                  <ChevronRight />
                </>
              }
              size="$5"
              onPress={() => setWeatherModalOpen(true)}
            />
            <UpdateModal
              type="select"
              label={"収穫天候"} //TODO:i18n
              open={weatherModalOpen}
              options={
                harvestWeathers
                  ? harvestWeathers.map((weather) => ({
                      label: weather.name,
                      value: weather.id,
                    }))
                  : [{ label: "", value: 0 }]
              }
              value={
                diaries.find((diary) => diary.id === diaryId)?.weatherId ?? 0
              }
              schema={diaryResponseSchema.shape.weatherId}
              submitFunc={async (val) => {
                try {
                  const res = await (
                    await client()
                  ).api.diaries[":id"].$patch({
                    param: {
                      id: diaryId,
                    },
                    json: { weatherId: String(val) },
                  });
                  if (!res.ok) {
                    setHarvestWeatherError(i18n.t("network-request-failed"));
                    return;
                  }
                  setWeatherModalOpen(false);
                  setRefresh(true);
                } catch {
                  setHarvestWeatherError(i18n.t("network-request-failed"));
                }
              }}
              errorMessage={harvestWeatherError}
              closeModal={() => {
                setWeatherModalOpen(false);
                setHarvestWeatherError("");
              }}
            />
          </YGroup.Item>
          {/* メモ */}
          <YGroup.Item>
            <ListItem
              hoverTheme
              pressTheme
              title={
                <XStack alignItems="center" gap="$4">
                  <StickyNote size="$3" strokeWidth={1.5} />
                  <Text fontSize="$8" fontWeight={400}>
                    {i18n.t("memo")}
                  </Text>
                </XStack>
              }
              iconAfter={
                <>
                  <SizableText>
                    {diaries.find((diary) => diary.id === diaryId)?.note}
                  </SizableText>
                  <ChevronRight />
                </>
              }
              size="$5"
              onPress={() => {
                console.log("diarieId", diaryId);
                setMemoModalOpen(true);
              }}
            />
            <UpdateModal
              type="input"
              label={i18n.t("memo")}
              open={memoModalOpen}
              value={diaries.find((diary) => diary.id === diaryId)?.note ?? ""}
              schema={diaryResponseSchema.shape.note}
              submitFunc={async (val) => {
                try {
                  const res = await (
                    await client()
                  ).api.diaries[":id"].$patch({
                    param: {
                      id: diaryId,
                    },
                    json: {
                      note: String(val),
                    },
                  });
                  if (!res.ok) {
                    setMemoError(i18n.t("network-request-failed"));
                    return;
                  }
                  setMemoModalOpen(false);
                  setRefresh(true);
                } catch {
                  setMemoError(i18n.t("network-request-failed"));
                }
              }}
              errorMessage={memoError}
              closeModal={() => {
                setMemoModalOpen(false);
                setMemoError("");
              }}
            />
          </YGroup.Item>
        </YGroup>
        {/* 戻る */}
        <YStack alignItems="center">
          <Link href="/(tabs)/diaries" asChild>
            <Card
              bordered
              alignItems="center"
              padding="$4"
              width="30%"
              pressStyle={{ scale: 0.97 }}
            >
              <XStack alignItems="center">
                <ChevronLeft size="$2" color="$color" />
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
  );
}
