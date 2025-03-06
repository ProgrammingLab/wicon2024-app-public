import { ChevronRight } from "@tamagui/lucide-icons";
import { diaryResponseSchema } from "backend/src/schema/diary";
import { diaryPackSchema } from "backend/src/schema/diaryPack";
import dayjs from "dayjs";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Card, Separator, Text, XStack, YStack } from "tamagui";
import { z } from "zod";

import { useAuthContext } from "@/context/auth";
import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";
export default function DiaryList() {
  const [diaries, setDiaries] = useState<z.infer<typeof diaryResponseSchema>[]>(
    [],
  );
  const [diaryPack, setDiaryPack] = useState<z.infer<typeof diaryPackSchema>[]>(
    [],
  );

  const auth = useAuthContext();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await (await client()).api.diaries.$get();
        if (!res.ok) return;
        const json = await res.json();
        if (!json) return;
        setDiaries(json);
        const res2 = await (await client()).api.diaryPacks.$get();
        if (!res2.ok) return;
        const json2 = await res2.json();
        if (!json2) return;
        setDiaryPack(json2);
      } catch (error) {
        console.error(error);
      }
    };
    fetch();
  }, [auth]);

  const delayedSchedules = diaries.filter((diary) => diary.type === "schedule");
  const diariesNew = diaries.filter(
    (diary) => diary.type === "record" && dayjs(diary.createdAt) == dayjs(),
  );
  const diariesRecord = diaries.filter(
    (diary) =>
      diary.type === "record" && dayjs(diary.datetime).isBefore(dayjs()),
  );
  console.log("All diaries:", diaries);
  console.log("Filtered diariesRecord:", diariesRecord);

  return (
    <XStack gap="$2" width="100%">
      <YStack gap="$2" width="100%">
        <XStack gap="$2" width="50%">
          <YStack gap="$2" width="100%">
            <Text fontWeight="bold" fontSize="$7">
              {i18n.t("recordToday")}
            </Text>
            {diariesNew.map((diary) => (
              <Card
                key={diary.id}
                bordered
                padding="$4"
                width="100%"
                pressStyle={{ scale: 0.97 }}
                backgroundColor={
                  diary.type === "schedule"
                    ? dayjs(diary.datetime).isBefore(dayjs())
                      ? "#ffcdd2" // 予定が遅れている場合は赤
                      : "#ADD8E6" // 通常の予定は青
                    : "#F8F8F8" // 記録は白
                }
                onPress={() => {
                  router.push({
                    pathname: "/(tabs)/diaries/[id]",
                    params: { id: diary.id },
                  });
                }}
              >
                <XStack alignItems="center" justifyContent="space-between">
                  {/* 作業項目や作付情報 */}
                  <YStack>
                    <XStack>
                      <Text fontWeight="bold" fontSize="$7">
                        {
                          diaryPack.find(
                            (pack) => pack.id === diary.diaryPackId,
                          )?.name
                        }
                      </Text>
                      <Separator />
                      <Text fontWeight="bold" fontSize="$7">
                        {diary.task}
                      </Text>
                    </XStack>

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
          <YStack gap="$2" width="100%">
            <Text fontWeight="bold" fontSize="$7">
              {i18n.t("futureSchedule")}
            </Text>
            {delayedSchedules.map((diary) => (
              <Card
                key={diary.id}
                bordered
                padding="$4"
                width="100%"
                pressStyle={{ scale: 0.97 }}
                backgroundColor={
                  diary.type === "schedule"
                    ? dayjs(diary.datetime).isBefore(dayjs())
                      ? "#ffcdd2" // 予定が遅れている場合は赤
                      : "#ADD8E6" // 通常の予定は青
                    : "#F8F8F8" // 記録は白
                }
                onPress={() => {
                  router.push({
                    pathname: "/(tabs)/diaries/[id]",
                    params: { id: diary.id },
                  });
                }}
              >
                <XStack alignItems="center" justifyContent="space-between">
                  {/* 作業項目や作付情報 */}
                  <YStack>
                    <Text fontWeight="bold" fontSize="$7">
                      {
                        diaryPack.find((pack) => pack.id === diary.diaryPackId)
                          ?.name
                      }
                      -{diary.task}
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
        </XStack>
        <Text fontWeight="bold" fontSize="$7">
          {i18n.t("recordDiary")}
        </Text>
        {diariesRecord.map((diary) => (
          <Card
            key={diary.id}
            bordered
            padding="$4"
            width="100%"
            pressStyle={{ scale: 0.97 }}
            backgroundColor={
              diary.type === "schedule"
                ? dayjs(diary.datetime).isBefore(dayjs())
                  ? "#ffcdd2" // 予定が遅れている場合は赤
                  : "#ADD8E6" // 通常の予定は青
                : "#F8F8F8" // 記録は白
            }
            onPress={() => {
              router.push({
                pathname: "/(tabs)/diaries/[id]",
                params: { id: diary.id },
              });
            }}
          >
            <XStack alignItems="center" justifyContent="space-between">
              {/* 作業項目や作付情報 */}
              <YStack>
                <Text fontWeight="bold" fontSize="$7">
                  {
                    diaryPack.find((pack) => pack.id === diary.diaryPackId)
                      ?.name
                  }
                  -{diary.task}
                </Text>
                <Text
                  color={
                    diary.type === "schedule" &&
                    dayjs(diary.datetime).isBefore(dayjs())
                      ? "$red10"
                      : "$colorSubtitle"
                  }
                >
                  {`- ${dayjs(diary.datetime).format("YYYY/MM/DD")}`}
                </Text>
              </YStack>
              {/* 右矢印アイコン */}
              <ChevronRight size="$2" color="$color" />
            </XStack>
          </Card>
        ))}
      </YStack>
    </XStack>
  );
}
