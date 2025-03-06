import {
  Archive,
  BookCopy,
  Carrot,
  ChevronLeft,
  ChevronRight,
  ClipboardPen,
  Columns3,
  HandCoins,
  ListPlus,
  ReceiptText,
  Settings2,
  SprayCan,
  Sprout,
  StickyNote,
} from "@tamagui/lucide-icons";
import { cropSchema } from "backend/src/schema/crop";
import { cropGroupResponseSchema } from "backend/src/schema/cropGroup";
import { diaryResponseSchema } from "backend/src/schema/diary";
import { diaryPackSchema } from "backend/src/schema/diaryPack";
import { fieldSchema } from "backend/src/schema/field";
import dayjs from "dayjs";
import japan from "dayjs/locale/ja";
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { RefreshControl, SafeAreaView } from "react-native";
import {
  Card,
  H1,
  H2,
  ScrollView,
  Separator,
  styled,
  Switch,
  Text,
  XGroup,
  XStack,
  YStack,
} from "tamagui";
import { z } from "zod";

import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

import { FieldPreview } from "../../../components/fieldPreview";

dayjs.locale(japan);

// eslint-disable-next-line @typescript-eslint/no-unused-vars

let fieldId = 0;
let cropId = 0;

export default function Diary() {
  const [selectedItem, setSelectedItem] = useState<"map" | "list">("map"); // "map" or "list"
  const handleSwitchChange = (checked: boolean) => {
    setSelectedItem(checked ? "list" : "map");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <XStack padding="$2" flex={1}>
        <YStack gap="$2" width="100%" flex={1}>
          <Switch
            size="$5"
            alignSelf="center"
            checked={selectedItem === "list"}
            onCheckedChange={handleSwitchChange}
          >
            <Switch.Thumb animation="quicker" />
          </Switch>

          <ScrollView
            width="100%"
            flex={1}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {selectedItem === "map" && <DiaryMap />}
            {selectedItem === "list" && <DiaryList />}
          </ScrollView>
        </YStack>
      </XStack>
    </SafeAreaView>
  );
}
export function DiaryList() {
  const params = useLocalSearchParams<{ view: string }>();

  const [refresh, setRefresh] = useState(false);
  //API
  const [diaryPacks, setDiaryPacks] = useState<
    z.infer<typeof diaryPackSchema>[]
  >([]);
  const [fields, setFields] = useState<z.infer<typeof fieldSchema>[]>([]);
  const [cropGroups, setCropGroups] = useState<
    z.infer<typeof cropGroupResponseSchema>[]
  >([]);
  const [crops, setCrops] = useState<z.infer<typeof cropSchema>[]>([]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await (await client()).api.diaryPacks.$get();
        if (!res.ok) return;
        const json = await res.json();
        if (!json) return;
        setDiaryPacks(json);
        const res2 = await (await client()).api.fields.$get();
        if (!res2.ok) return;
        const json2 = await res2.json();
        if (!json2) return;
        setFields(json2);
        const res3 = await (await client()).api.diaries.cropGroups.$get();
        if (!res3.ok) return;
        const json3 = await res3.json();
        if (!json3) return;
        setCropGroups(json3);
        const res4 = await (await client()).api.diaries.crops.$get();
        if (!res4.ok) return;
        const json4 = await res4.json();
        if (!json4) return;
        setCrops(json4);
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
    setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    params.view = "";
  });

  return (
    <>
      {params.view === "field" ? (
        <XStack padding="$2">
          <YStack gap="$4" width="100%">
            {diaryPacks
              .filter((packs) => packs.fieldId === fieldId) // 圃場IDでフィルター
              .map((packs) => packs.cropId) // 作付IDを取得
              .filter((cropId, index, self) => self.indexOf(cropId) === index) // 重複を削除
              .map(
                (cropId) => crops.find((crop) => crop.id === cropId), // 作付IDから作付を取得
              )
              .filter((crop) => crop !== undefined && crop !== null) // 作付が存在するものだけを取得
              .map(
                (
                  crop, // 作付ごとにリストを表示
                ) => (
                  <Link
                    key={crop?.id}
                    href={{
                      pathname: "/(tabs)/diaries",
                      params: { view: "overview" },
                    }}
                    asChild
                  >
                    <Card
                      bordered
                      padding="$5"
                      width="100%"
                      pressStyle={{ scale: 0.97 }}
                      onPress={() => {
                        cropId = crop?.id || 0;
                        setRefresh(true);
                      }}
                    >
                      <XStack
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <XStack alignItems="center">
                          <Text fontSize="$7" fontWeight="bold">
                            {crop?.name}
                          </Text>
                        </XStack>
                      </XStack>
                    </Card>
                  </Link>
                ),
              )}
            {/* 戻る */}
            <YStack alignItems="center">
              <Link href="/diaries" asChild>
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
      ) : params.view === "crop" ? (
        <XStack padding="$2">
          <YStack gap="$4" width="100%">
            {diaryPacks
              .filter((diary) => diary.cropId === cropId) // 作物IDでフィルタリング
              .map((diary) => diary.fieldId) // 各日誌のフィールドIDを取得
              .filter((fieldId, index, self) => self.indexOf(fieldId) === index) // 重複を削除
              .map((fieldId) => fields.find((field) => field.id === fieldId)) // フィールドIDから対応するフィールドを取得
              .filter((field) => field !== undefined && field !== null) // 存在するフィールドのみを残す
              .map((field) => (
                <Link
                  key={field.id}
                  href={{
                    pathname: "/(tabs)/diaries",
                    params: { view: "overview" },
                  }}
                  asChild
                >
                  <Card
                    bordered
                    padding="$5"
                    width="100%"
                    pressStyle={{ scale: 0.97 }}
                    onPress={() => {
                      fieldId = field?.id || 0;
                      setRefresh(true);
                    }}
                  >
                    <XStack alignItems="center" justifyContent="space-between">
                      <XStack alignItems="center">
                        <Text fontSize="$7" fontWeight="bold">
                          {field.name}
                        </Text>
                      </XStack>
                    </XStack>
                  </Card>
                </Link>
              ))}
            {/* 戻る */}
            <YStack alignItems="center">
              <Link href="/diaries" asChild>
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
      ) : params.view === "overview" ? (
        <Overview />
      ) : (
        <XStack padding="$2">
          <YStack gap="$2" width="100%">
            {/* 圃場一覧 */}
            <XStack alignItems="center" gap="$2">
              <Columns3 size={36} />
              <H1
                fontSize={36}
                color="$primary"
                letterSpacing={2}
                fontWeight="400"
              >
                {i18n.t("listOfFields")}
              </H1>
            </XStack>
            <Separator alignSelf="stretch" borderColor={"$color"} />
            <YStack gap="$2">
              {fields.map((field) => (
                <Link
                  key={field.id}
                  href={{
                    pathname: "/(tabs)/diaries",
                    params: { view: "field" },
                  }}
                  asChild
                >
                  <Card
                    bordered
                    padding="$5"
                    width="100%"
                    pressStyle={{ scale: 0.97 }}
                    onPress={() => {
                      fieldId = field.id;
                      setRefresh(true);
                    }}
                  >
                    <XStack alignItems="center" justifyContent="space-between">
                      <XStack alignItems="center">
                        <Text fontSize="$7" fontWeight="bold">
                          {field.name}
                        </Text>
                      </XStack>
                    </XStack>
                  </Card>
                </Link>
              ))}
            </YStack>
            {/* 作付一覧 */}
            <XStack alignItems="center" gap="$2">
              <Carrot size={36} />
              <H1
                fontSize={36}
                color="$primary"
                letterSpacing={2}
                fontWeight="400"
              >
                {i18n.t("listOfCrops")}
              </H1>
            </XStack>
            <Separator alignSelf="stretch" borderColor={"$color"} />
            <YStack gap="$2">
              {cropGroups.map((group) => (
                <React.Fragment key={group.id}>
                  <Text fontSize="$8" fontWeight="bold" marginVertical="$4">
                    {group.name}
                  </Text>
                  {group.crops.map((crop) => (
                    <Link
                      key={crop.id}
                      href={{
                        pathname: "/(tabs)/diaries",
                        params: { view: "crop" },
                      }}
                      asChild
                    >
                      <Card
                        bordered
                        padding="$5"
                        width="100%"
                        pressStyle={{ scale: 0.97 }}
                        onPress={() => {
                          cropId = crop.id;
                          setRefresh(true);
                        }}
                      >
                        <XStack
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <XStack alignItems="center">
                            <Text fontSize="$7" fontWeight="bold">
                              {crop.name}
                            </Text>
                          </XStack>
                        </XStack>
                      </Card>
                    </Link>
                  ))}
                </React.Fragment>
              ))}
            </YStack>
            {/* 日誌の設定*/}
            <XStack alignItems="center" gap="$2">
              <Settings2 size={36} />
              <H1
                fontSize={36}
                color="$primary"
                letterSpacing={2}
                fontWeight="400"
              >
                {i18n.t("diariesSettings")}
              </H1>
            </XStack>
            <Separator alignSelf="stretch" borderColor={"$color"} />
            <Link href="/(tabs)/diaries/diaryPack" asChild>
              <Card
                bordered
                padding="$4"
                width="100%"
                pressStyle={{ scale: 0.97 }}
              >
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap="$2">
                    <BookCopy size={36} />
                    <YStack>
                      <Text fontWeight="bold" fontSize="$7">
                        {i18n.t("diaryPack")}
                      </Text>
                    </YStack>
                  </XStack>
                  <ChevronRight size={24} color="$color" />
                </XStack>
              </Card>
            </Link>
            <Link href="/(tabs)/diaries/crops" asChild>
              <Card
                bordered
                padding="$4"
                width="100%"
                pressStyle={{ scale: 0.97 }}
              >
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap="$2">
                    <Carrot size={36} />
                    <YStack>
                      <Text fontWeight="bold" fontSize="$7">
                        {i18n.t("cropSettings")}
                      </Text>
                    </YStack>
                  </XStack>
                  <ChevronRight size={24} color="$color" />
                </XStack>
              </Card>
            </Link>
            <Link href="/(tabs)/diaries/fertilizers" asChild>
              <Card
                bordered
                padding="$4"
                width="100%"
                pressStyle={{ scale: 0.97 }}
              >
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap="$2">
                    <ReceiptText size={36} />
                    <YStack>
                      <Text fontWeight="bold" fontSize="$7">
                        {i18n.t("FertilizerSettings")}
                      </Text>
                    </YStack>
                  </XStack>
                  <ChevronRight size={24} color="$color" />
                </XStack>
              </Card>
            </Link>
            <Link href="/(tabs)/diaries/pesticides" asChild>
              <Card
                bordered
                padding="$4"
                width="100%"
                pressStyle={{ scale: 0.97 }}
              >
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap="$2">
                    <SprayCan size={36} />
                    <YStack>
                      <Text fontWeight="bold" fontSize="$7">
                        {i18n.t("pesticidesSettings")}
                      </Text>
                    </YStack>
                  </XStack>
                  <ChevronRight size={24} color="$color" />
                </XStack>
              </Card>
            </Link>
            <Link href="/(tabs)/diaries/export" asChild>
              <Card
                bordered
                padding="$4"
                width="100%"
                pressStyle={{ scale: 0.97 }}
              >
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap="$2">
                    <ListPlus size={36} />
                    <YStack>
                      <Text fontWeight="bold" fontSize="$7">
                        {i18n.t("exportDiaries")}
                      </Text>
                    </YStack>
                  </XStack>
                  <ChevronRight size={24} color="$color" />
                </XStack>
              </Card>
            </Link>
          </YStack>
        </XStack>
      )}
    </>
  );
}

function Overview() {
  const [refresh, setRefresh] = useState(false);
  const [diaryPacks, setDiaryPacks] = useState<
    z.infer<typeof diaryPackSchema>[]
  >([]);
  const [fields, setFields] = useState<z.infer<typeof fieldSchema>[]>([]);
  const [diaries, setDiaries] = useState<z.infer<typeof diaryResponseSchema>[]>(
    [],
  );
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await (await client()).api.diaryPacks.$get();
        if (!res.ok) return;
        const json = await res.json();
        if (!json) return;
        setDiaryPacks(json);
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
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
    setRefresh(false);
  }, [refresh]);

  let packId = 0;

  const getFieldName = (fieldId: number) =>
    fields.find((field) => field.id === fieldId)?.name || 0;
  //播種・消毒・収穫の日付を取得
  const getTaskDates = (packId: number, val: number): string[] => {
    const taskDates: { [key: number]: string[] } = {
      1: diaries
        .filter(
          (diary) =>
            diary.diaryPackId === packId &&
            diary.type === "record" &&
            diary.taskId === "template-1",
        )
        .map((diary) => diary.datetime),
      2: diaries
        .filter(
          (diary) =>
            diary.diaryPackId === packId &&
            diary.type === "record" &&
            diary.taskId === "template-2",
        )
        .map((diary) => diary.datetime),
      3: diaries
        .filter(
          (diary) =>
            diary.diaryPackId === packId &&
            diary.type === "record" &&
            diary.taskId === "template-3",
        )
        .map((diary) => diary.datetime),
    };
    return taskDates[val] || [];
  };
  const getShoudokuCnt = (packId: number) => {
    const cnt = diaries.filter(
      (diary) =>
        diary.diaryPackId === packId &&
        diary.taskId === "template-2" &&
        diary.type === "record",
    ).length;
    return cnt;
  };

  const onBack = () => {
    fieldId = 0;
    cropId = 0;
    router.push("/(tabs)/diaries");
  };

  return (
    <XStack padding="$3">
      <YStack gap="$4" width="100%">
        {diaryPacks
          .filter((diary) => diary.fieldId === fieldId)
          .filter((diary) => diary.cropId === cropId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .map((diary) => (
            <Card
              key={diary.id}
              padding="$4"
              width="100%"
              backgroundColor="#F0F0F0"
            >
              <XStack alignItems="center" gap="$2">
                <Archive size="$3" />
                <H1
                  fontSize="$9"
                  color="$primary"
                  letterSpacing="$1"
                  fontWeight="400"
                >
                  {diary.name}
                  {i18n.t("overview")}
                </H1>
                {(() => {
                  packId = diary.id;
                  // return console.log("packId: ", packId);
                })()}
              </XStack>
              <Separator alignSelf="stretch" borderColor={"$color"} />
              {/* 作業日誌追加 */}
              <Card
                bordered
                padding="$4"
                width="100%"
                pressStyle={{ scale: 0.97 }}
                onPress={() => {
                  router.push(`/diaries/add?pack=${diary.id}`); //should
                }}
              >
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap="$2">
                    <ClipboardPen size="$3" />
                    <YStack>
                      <Text fontWeight="bold" fontSize="$7">
                        {i18n.t("AddDiary")}
                      </Text>
                      <Text color="$colorSubtitle">
                        {i18n.t("scheduleORrecord")}
                      </Text>
                    </YStack>
                  </XStack>
                  <ChevronRight size="$2" color="$color" />
                </XStack>
              </Card>
              <Separator />
              {/* 作業日誌詳細 */}
              <XGroup gap="$2">
                <XGroup.Item>
                  <Card padding="$4" gap="$4" width="50%" bordered>
                    <XGroup alignItems="center">
                      <XGroup.Item>
                        <Sprout size="$3" color="$color" padding="$2" />
                      </XGroup.Item>
                      <XGroup.Item>
                        <YStack>
                          <Text fontWeight="bold" fontSize="$7">
                            {i18n.t("sowingDate")}:
                            {getTaskDates(packId, 1)
                              .map((date) => dayjs(date).format("YYYY/MM/DD"))
                              .join(", ")}
                          </Text>
                          <Text>
                            {i18n.t("NDSsowing")}:
                            {dayjs().diff(getTaskDates(packId, 1)[0], "day")}
                          </Text>
                        </YStack>
                      </XGroup.Item>
                    </XGroup>
                    <XGroup alignItems="center">
                      <XGroup.Item>
                        <SprayCan size="$3" color="$color" padding="$2" />
                      </XGroup.Item>
                      <XGroup.Item>
                        <YStack>
                          <XStack>
                            <Text fontWeight="bold" fontSize="$7">
                              {i18n.t("dateOfPesticideApplication")}:
                              {getTaskDates(packId, 2)
                                .map((date) => dayjs(date).format("YYYY/MM/DD"))
                                .join(", ")}
                              {"　"}({i18n.t("Ndisinfections")}:
                              {getShoudokuCnt(packId)})
                            </Text>
                          </XStack>
                          <Text>
                            {i18n.t("NDSdisinfection")}:
                            {dayjs().diff(getTaskDates(packId, 2)[0], "day")}
                          </Text>
                        </YStack>
                      </XGroup.Item>
                    </XGroup>
                    <XGroup alignItems="center">
                      <XGroup.Item>
                        <HandCoins size="$3" color="$color" padding="$2" />
                      </XGroup.Item>
                      <XGroup.Item>
                        <YStack>
                          <Text fontWeight="bold" fontSize="$7">
                            {i18n.t("harvestDate")}:
                            {getTaskDates(packId, 3)
                              .map((date) => dayjs(date).format("YYYY/MM/DD"))
                              .join(", ")}
                          </Text>
                          <Text>
                            {i18n.t("warmOrCool")}:
                            {
                              diaryPacks.filter(
                                (diary) => diary.id === diary.id,
                              )[0]?.averageSeasonType
                            }
                          </Text>
                        </YStack>
                      </XGroup.Item>
                    </XGroup>
                    <XGroup alignItems="center">
                      <XGroup.Item>
                        <Columns3 size="$3" color="$color" padding="$2" />
                      </XGroup.Item>
                      <XGroup.Item>
                        <YStack>
                          <Text fontWeight="bold" fontSize="$7">
                            {getFieldName(fieldId)}
                          </Text>
                          <Text>めも（{fieldId}のリストの）</Text>
                        </YStack>
                      </XGroup.Item>
                    </XGroup>
                    <XGroup alignItems="center">
                      <XGroup.Item>
                        <StickyNote size="$3" color="$color" padding="$2" />
                      </XGroup.Item>
                      <XGroup.Item>
                        <YStack>
                          <Text fontWeight="bold" fontSize="$7">
                            {i18n.t("memo")}
                          </Text>
                          <Text>めも（{cropId}のリストの）</Text>
                        </YStack>
                      </XGroup.Item>
                    </XGroup>
                  </Card>
                </XGroup.Item>
                <XGroup.Item>
                  <YStack gap="$2" width="50%">
                    <H2
                      fontSize={30}
                      color="$primary"
                      letterSpacing="$1"
                      fontWeight="400"
                    >
                      {i18n.t("listOfDiaries")}
                    </H2>

                    {diaries
                      .filter((diary) => diary.diaryPackId === packId)
                      .sort((a, b) => {
                        if (b.type === "schedule" && a.type !== "schedule")
                          return 1;
                        if (a.type === "schedule" && b.type !== "schedule")
                          return -1;
                        return (
                          new Date(b.datetime).getTime() -
                          new Date(a.datetime).getTime()
                        );
                      })
                      .map((diary) => (
                        <Card
                          key={diary.id}
                          bordered
                          padding="$4"
                          width="100%"
                          pressStyle={{ scale: 0.97 }}
                          backgroundColor={
                            diary.type === "schedule"
                              ? dayjs(diary.datetime).isBefore(dayjs())
                                ? "#ffcdd2" // 予定が遅れている場合は赤っぽい色
                                : "#ADD8E6" // 通常の予定は青
                              : "#F8F8F8" // 記録は白
                          }
                          onPress={() => {
                            router.push({
                              pathname: "/diaries/[id]",
                              params: { id: diary.id },
                            });
                          }}
                        >
                          <XStack
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            {/* 作業項目や作付情報 */}
                            <YStack>
                              <Text fontWeight="bold" fontSize="$7">
                                {diary.task}
                              </Text>
                              <Text
                                color={
                                  diary.type === "schedule" &&
                                  dayjs(diary.datetime).isBefore(dayjs())
                                    ? "$red10"
                                    : "$colorSubtitle"
                                }
                              >
                                {`- ${dayjs(diary.datetime).format("MM/DD")}`}
                              </Text>
                            </YStack>
                            {/* 右矢印アイコン */}
                            <ChevronRight size="$2" color="$color" />
                          </XStack>
                        </Card>
                      ))}
                  </YStack>
                </XGroup.Item>
              </XGroup>
              <Separator />
              {/* 戻る */}
              <YStack alignItems="center">
                <Card
                  bordered
                  alignItems="center"
                  padding="$4"
                  width="30%"
                  pressStyle={{ scale: 0.97 }}
                  onPress={onBack}
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
              </YStack>
            </Card>
          ))}
      </YStack>
    </XStack>
  );
}

export function DiaryMap() {
  const [fields, setFields] = useState<z.infer<typeof fieldSchema>[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [selectedField, setSelectedField] = useState<z.infer<
    typeof fieldSchema
  > | null>(null);
  const params = useLocalSearchParams<{ view: string }>();
  const [view, setView] = useState(params.view || "default");
  const [diaryPacks, setDiaryPacks] = useState<
    z.infer<typeof diaryPackSchema>[]
  >([]);
  const [crops, setCrops] = useState<z.infer<typeof cropSchema>[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await (await client()).api.fields.$get();
        if (!res.ok) return;
        const json = await res.json();
        if (!json) return;
        setFields(json);
        const res1 = await (await client()).api.diaryPacks.$get();
        if (!res1.ok) return;
        const json1 = await res1.json();
        if (!json1) return;
        setDiaryPacks(json1);
        const res2 = await (await client()).api.diaries.crops.$get();
        if (!res2.ok) return;
        const json2 = await res2.json();
        if (!json2) return;
        setCrops(json2);
      } catch (e) {
        console.error(e);
      }
      setRefresh(false);
    })();
  }, [refresh]);

  const handleCardPress = (id: number) => {
    cropId = id;
    setView("overview");
    setRefresh(true);
  };

  const onBack = () => {
    setSelectedField(null);
    setView("default");
    fieldId = 0;
    cropId = 0;
    // setRefresh(true);
    router.push("/(tabs)/diaries");
  };

  //debug
  // useEffect(() => {
  //   console.log("fieldId", fieldId);
  //   console.log("cropId", cropId);
  //   console.log("selectedField", selectedField);
  //   console.log("diaryPacks", diaryPacks);
  //   console.error("view", view);
  // }, [fieldId, cropId, selectedField, diaryPacks, view]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refresh}
          onRefresh={() => setRefresh(true)}
        />
      }
    >
      <YStack gap="$4" width="100%">
        {selectedField !== null && fieldId !== 0 ? (
          <>
            {view === "overview" ? (
              <Overview />
            ) : (
              <XStack padding="$2" width="100%">
                <YStack gap="$4" width="100%">
                  {diaryPacks
                    .filter((packs) => packs.fieldId === fieldId) // 圃場IDでフィルター
                    .map((packs) => packs.cropId) // 作付IDを取得
                    .filter(
                      (cropId, index, self) => self.indexOf(cropId) === index,
                    ) // 重複を削除
                    .map(
                      (cropId) => crops.find((crop) => crop.id === cropId), // 作付IDから作付を取得
                    )
                    .filter((crop) => crop !== undefined && crop !== null) // 作付が存在するものだけを取得
                    .map(
                      (
                        crop, // 作付ごとにリストを表示
                      ) => (
                        <Card
                          key={crop?.id}
                          asChild
                          bordered
                          padding="$5"
                          width="100%"
                          pressStyle={{ scale: 0.97 }}
                          onPress={() => handleCardPress(crop?.id || 0)}
                        >
                          <XStack
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <XStack alignItems="center">
                              <Text fontSize="$7" fontWeight="bold">
                                {crop?.name}
                              </Text>
                            </XStack>
                          </XStack>
                        </Card>
                      ),
                    )}
                  {/* 戻る */}
                  <YStack alignItems="center">
                    <Card
                      bordered
                      alignItems="center"
                      padding="$4"
                      width="30%"
                      pressStyle={{ scale: 0.97 }}
                      onPress={onBack}
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
                  </YStack>
                </YStack>
              </XStack>
            )}
          </>
        ) : (
          <XStack fw="wrap">
            {fields.map((field, index) => (
              <FieldCard
                key={index}
                field={field}
                onSelect={() => {
                  setSelectedField(field);
                  setView("default");
                  fieldId = field.id;
                }}
              />
            ))}
          </XStack>
        )}
      </YStack>
    </ScrollView>
  );
}

function FieldCard({
  field,
  onSelect,
}: {
  field: z.infer<typeof fieldSchema>;
  onSelect: () => void;
}) {
  const Card = styled(YStack, {
    w: 280,
    h: 280,
    bg: "$background",
    m: "$4",
    borderBottomRightRadius: "$2",
    borderBottomLeftRadius: "$2",
    pressStyle: {
      scale: 0.95,
    },
    elevation: 1,
    animation: "quicker",
  });

  return (
    <>
      <Card onPress={onSelect}>
        <FieldPreview field={field} />
        <Text marginHorizontal="$4" marginVertical="$2">
          {i18n.t("Updated at")} {field.updatedAt}
        </Text>
        <Text
          fontSize={20}
          marginHorizontal="$4"
          fontWeight="bold"
          marginBottom="$3"
        >
          {field.name}
        </Text>
      </Card>
    </>
  );
}
