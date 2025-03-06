import { fieldSchema } from "backend/src/schema/field";
import { router } from "expo-router";
import React from "react";
import { useEffect, useState } from "react";
import { RefreshControl } from "react-native";
import { Circle, ScrollView, styled, Text, XStack, YStack } from "tamagui";
import { z } from "zod";

import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

import { FieldPreview } from "../../../components/fieldPreview";

type schema = z.infer<typeof fieldSchema>;

export default function Fields() {
  const [fields, setFields] = useState<schema[]>([]);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const res = await (await client()).api.fields.$get();
        if (!res.ok) return;
        const json = await res.json();
        if (!json) return;
        setFields(json);
      } catch (e) {
        console.error(e);
      }
      setRefreshing(false);
      setNeedRefresh(false);
    })();
  }, [needRefresh]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => setNeedRefresh(true)}
        />
      }
    >
      <XStack fw="wrap">
        <Card
          jc="center"
          ai="center"
          onPress={() => {
            router.push("/fields/add");
          }}
        >
          <Circle
            size={80}
            bg="$accentBackground"
            elevation={1}
            pressStyle={{ scale: 0.95 }}
            animation="quicker"
            onPress={() => {
              router.push("/fields/add");
            }}
          >
            <Text fontSize={50}>+</Text>
          </Circle>
          <Text fontSize="$8" marginTop="$2" fontWeight="bold">
            {i18n.t("Add a field")}
          </Text>
        </Card>

        {fields.map((field, index) => (
          <FieldCard key={index} field={field} />
        ))}
      </XStack>
    </ScrollView>
  );
}

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

function FieldCard({ field }: { field: schema }) {
  return (
    <>
      <Card
        onPress={() => {
          router.push({ pathname: "/fields/[id]", params: { id: field.id } });
        }}
      >
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
