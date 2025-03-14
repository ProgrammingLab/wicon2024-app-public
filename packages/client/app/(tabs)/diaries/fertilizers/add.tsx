//肥料
/*
  * 肥料
  FertilizerRegistrationNumberBookmark
  * fertilizerRegistrationNumber(肥料登録番号)
*/
import { ChevronLeft, FilePlus2 } from "@tamagui/lucide-icons";
import { Link } from "expo-router";
import React from "react";
import {
  Card,
  H1,
  ScrollView,
  Separator,
  Text,
  XStack,
  YGroup,
  YStack,
} from "tamagui";

import i18n from "@/lib/i18n";

export default function AddFertilizers() {
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
              {i18n.t("AddPesticide")}
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
            {/* 農薬番号 */}
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
                    <Text fontWeight="bold" fontSize="$5">
                      {i18n.t("return")}
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            </Link>
          </YStack>
        </YStack>
      </XStack>
    </ScrollView>
  );
}
