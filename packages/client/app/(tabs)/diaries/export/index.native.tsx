/*
    EXCEL EXPORT
*/
import {
  ChevronLeft,
  FilePlus2,
  ListPlus,
  Shovel,
} from "@tamagui/lucide-icons";
import { diaryResponseSchema } from "backend/src/schema/diary";
import { diaryPackSchema } from "backend/src/schema/diaryPack";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import Share from "react-native-share";
import { Card, H1, ListItem, Text, XStack, YGroup, YStack } from "tamagui";
import * as XLSX from "xlsx";
import { z } from "zod";

import Select from "@/components/Select";
import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

export default function Export() {
  const [refresh, setRefresh] = useState(false);
  const [diaryPacks, setDiaryPacks] = useState<
    z.infer<typeof diaryPackSchema>[]
  >([]);
  const [selected, setSelected] = useState<string | number>("");
  const [diaries, setDiaries] = useState<z.infer<typeof diaryResponseSchema>[]>(
    [],
  );
  const [filteredDiaries, setFilteredDiaries] = useState<
    z.infer<typeof diaryResponseSchema>[]
  >([]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await (await client()).api.diaryPacks.$get();
        if (!res.ok) return;
        const json = await res.json();
        if (!json) return;
        setDiaryPacks(json);
        const res2 = await (await client()).api.diaries.$get();
        if (!res2.ok) return;
        const json2 = await res2.json();
        if (!json2) return;
        setDiaries(json2);
      } catch (error) {
        console.error(error);
      }
    };
    fetch();
    setRefresh(false);
  }, [refresh]);
  useEffect(() => {
    setFilteredDiaries(
      diaries.filter((diary) => diary.diaryPackId === selected),
    );
  }, [selected, diaries]);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      filteredDiaries.map(({ workerId, registrerId, ...other }) => other),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Diaries");
    const packName = diaryPacks.find((v) => v.id === selected)?.name;
    const now = new Date();
    const nowString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}T${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
    const filename = (packName ?? "") + " " + nowString;

    if (Platform.OS === "web") {
      XLSX.writeFile(workbook, filename);
    } else {
      const data = XLSX.write(workbook, {
        type: "base64",
        bookType: "xlsx",
      });
      console.log(data);
      Share.open({
        url:
          "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +
          data,
        filename: filename,
      });
    }
  };

  return (
    <XStack padding="$2">
      <YStack gap="$2" width="100%" alignItems="center">
        <XStack gap="$2">
          <ListPlus size="$3" />
          <H1
            fontSize="$9"
            color="$primary"
            letterSpacing="$1"
            fontWeight="400"
          >
            {i18n.t("exportDiaries")}
          </H1>
        </XStack>
        <YGroup width="100%" alignItems="center">
          <YGroup.Item>
            <ListItem
              hoverTheme
              title={
                <XStack alignItems="center" gap="$4">
                  <Shovel size="$3" strokeWidth={1.5} />
                  <Text fontSize="$8" fontWeight={400}>
                    {i18n.t("exportDiaries")}
                  </Text>
                </XStack>
              }
              iconAfter={
                <XStack width="$20">
                  <YStack width="$20">
                    <Select
                      options={
                        diaryPacks
                          ? diaryPacks.map((diaries) => ({
                              label: diaries.name,
                              value: diaries.id,
                            }))
                          : [{ label: "No diary packs", value: "" }]
                      }
                      selectedValue={selected}
                      onValueChange={(value) => setSelected(value)}
                    />
                  </YStack>
                </XStack>
              }
              size="$5"
            />
          </YGroup.Item>
        </YGroup>
        <Card
          bordered
          hoverTheme
          padding="$4"
          width="50%"
          pressStyle={{ scale: 0.97 }}
          onPress={handleExport}
        >
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$2">
              <FilePlus2 size="$3" strokeWidth={1.5} />
              <YStack>
                <Text fontWeight="bold" fontSize="$7">
                  {i18n.t("export")}
                </Text>
              </YStack>
            </XStack>
          </XStack>
        </Card>
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
    </XStack>
  );
}
