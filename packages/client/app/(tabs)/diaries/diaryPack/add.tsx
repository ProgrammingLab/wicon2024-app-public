/*
    DiaryPackAdd.tsx
    Create a new diary pack
    * name
    * warmOrCool
    * Field
    * CropVariety
*/

import {
  ALargeSmall,
  Carrot,
  ChevronLeft,
  Columns3,
  FilePlus2,
  ThermometerSnowflake,
} from "@tamagui/lucide-icons";
import { cropSchema } from "backend/src/schema/crop";
import { diaryPackSchema } from "backend/src/schema/diaryPack";
import { fieldSchema } from "backend/src/schema/field";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Card,
  H1,
  Input,
  ListItem,
  ScrollView,
  Separator,
  Text,
  XStack,
  YGroup,
  YStack,
} from "tamagui";
import { z } from "zod";

import Select from "@/components/Select";
import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

export default function DiaryPackAdd() {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  type FormData = {
    id: z.infer<typeof diaryPackSchema>["id"];
    name: z.infer<typeof diaryPackSchema>["name"];
    averageSeasonType: z.infer<typeof diaryPackSchema>["averageSeasonType"];
    field: number;
    cropVariety: number;
  };
  const defaultValues: FormData = {
    id: 0,
    name: "",
    averageSeasonType: "average" as "warm" | "cool" | "average",
    field: 0,
    cropVariety: 0,
  };

  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues,
  });

  // フォーム送信処理:TODO
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(data);
    try {
      const result = await (
        await client()
      ).api.diaryPacks.$post({
        json: {
          name: data.name,
          averageSeasonType: data.averageSeasonType,
          fieldId: data.field,
          // cropId: data.cropVariety,
          // name: "日記パック",
          // averageSeasonType: "warm",
          groupId: 1,
          cropId: 1,
          // fieldId: 1,
        },
      });
      console.log(result);
      if (!result.ok) {
        const errorData = await result.json();
        setErrorMessage(errorData.message || "エラーが発生しました");
        return;
      }
    } catch (e) {
      console.error(e);
    }
    setRefresh(true);
  };

  // フォームリセット処理
  const handleReset = () => {
    reset();
  };

  const [fieldList, setFieldList] = useState<z.infer<typeof fieldSchema>[]>([]);
  const [cropVarietyList, setCropVarietyList] = useState<
    z.infer<typeof cropSchema>[]
  >([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const res = await (await client()).api.fields.$get();
      if (!res.ok) return;
      const json = await res.json();
      setFieldList(json);
      const res2 = await (await client()).api.diaries.crops.$get();
      if (!res2.ok) return;
      const json2 = await res2.json();
      setCropVarietyList(json2);
    };
    fetch();
    setRefresh(false);
  }, [refresh]);

  return (
    <ScrollView>
      <XStack padding="$3">
        <YStack gap="$4" width="100%">
          <XStack alignItems="center" gap="$2">
            <FilePlus2 size="$3" />
            <H1
              fontSize="$9"
              color="$primary"
              letterSpacing="$1"
              fontWeight="400"
            >
              {i18n.t("AddDiaryPack")}
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
            {/* name */}
            <YGroup.Item>
              <ListItem
                hoverTheme
                title={
                  <XStack alignItems="center" gap="$4">
                    <ALargeSmall size="$3" strokeWidth={1.5} />
                    <Text fontSize="$8" fontWeight={400}>
                      {i18n.t("name")}
                    </Text>
                  </XStack>
                }
                iconAfter={
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        width="$20"
                        borderWidth={2}
                        placeholder={i18n.t("name")}
                        value={field.value as string}
                        onChangeText={field.onChange}
                      />
                    )}
                  />
                }
              />
            </YGroup.Item>
            {/* warmOrCool */}
            <YGroup.Item>
              <ListItem
                hoverTheme
                title={
                  <XStack alignItems="center" gap="$4">
                    <ThermometerSnowflake size={29} strokeWidth={1.5} />
                    <Text fontSize="$8" fontWeight={400}>
                      {i18n.t("warmOrCool")}
                    </Text>
                  </XStack>
                }
                iconAfter={
                  <Controller
                    name="averageSeasonType"
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <YStack width="$20">
                          <Select
                            options={[
                              { label: "Warm", value: "warm" },
                              { label: "Average", value: "average" },
                              { label: "Cool", value: "cool" },
                            ]} //TODO: i18n
                            selectedValue={value}
                            onValueChange={(selectedValue: string | number) => {
                              onChange(selectedValue);
                            }}
                          />
                        </YStack>
                      );
                    }}
                  />
                }
              />
            </YGroup.Item>
            {/* field */}
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
                  <Controller
                    name="field"
                    control={control}
                    render={({ field }) => (
                      <YStack width="$20">
                        <Select
                          options={fieldList.map((field) => ({
                            label: field.name,
                            value: field.id,
                          }))}
                          selectedValue={field.value}
                          onValueChange={field.onChange}
                        />
                      </YStack>
                    )}
                  />
                }
              />
            </YGroup.Item>
            {/* CropVariety */}
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
                  <Controller
                    name="cropVariety"
                    control={control}
                    render={({ field }) => (
                      <YStack width="$20">
                        <Select
                          options={cropVarietyList.map((crop) => ({
                            label: crop.name,
                            value: crop.id,
                          }))}
                          selectedValue={field.value}
                          onValueChange={field.onChange}
                        />
                      </YStack>
                    )}
                  />
                }
              />
            </YGroup.Item>
          </YGroup>
          {/* 送信&リセット */}
          <YStack alignItems="center">
            <Text color="$red10">{errorMessage}</Text>
            <XStack gap="$4">
              <Card
                bordered
                alignItems="center"
                padding="$4"
                width="30%"
                pressStyle={{ scale: 0.97 }}
                themeInverse
                onPress={handleSubmit(onSubmit)}
              >
                <Text fontWeight="bold" fontSize="$5">
                  {i18n.t("submit")}
                </Text>
              </Card>
              <Card
                bordered
                alignItems="center"
                padding="$4"
                width="30%"
                pressStyle={{ scale: 0.97 }}
                onPress={handleReset}
              >
                <Text fontWeight="bold" fontSize="$5">
                  {i18n.t("reset")}
                </Text>
              </Card>
            </XStack>
          </YStack>
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
                  <Text fontWeight="bold" fontSize="$5">
                    {i18n.t("return")}
                  </Text>
                </XStack>
              </Card>
            </Link>
          </YStack>
        </YStack>
      </XStack>
    </ScrollView>
  );
}
