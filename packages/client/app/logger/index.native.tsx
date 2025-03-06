import React, { useEffect, useState } from "react";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import { ScrollView, Text, XStack, YStack } from "tamagui";

import { logger } from "@/lib/logger";

export default function LogScreen() {
  const [files, setFiles] = useState<RNFS.ReadDirItem[]>([]);

  useEffect(() => {
    logger.getLogFiles().then((result) => {
      result.sort((a, b) => b.name.localeCompare(a.name));
      setFiles(result);
    });
  }, []);

  const onShare = (path: string) => {
    Share.open({
      url: "file://" + path,
      type: "text/plain",
    });
  };

  return (
    <ScrollView>
      <YStack>
        {files.map((i) => (
          <XStack
            key={i.name}
            m={8}
            p={2}
            borderBottomWidth={1}
            alignItems="flex-end"
            onPress={() => {
              onShare(i.path);
            }}
          >
            <Text fontSize={30}>{i.name}</Text>
            <Text fontSize={24} ml={32}>
              {i.size.toLocaleString()} B
            </Text>
          </XStack>
        ))}
        <XStack
          m={8}
          p={2}
          onPress={() => {
            logger.cut();
          }}
        >
          <Text fontSize={30}>ログ記録に区切りを入れる</Text>
        </XStack>
      </YStack>
    </ScrollView>
  );
}
