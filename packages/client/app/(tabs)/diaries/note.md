# 基本形式

```typescript
    <XStack padding="$2">
      <YStack gap="$2" width="100%">

      </YStack>
    </XStack>
```

## タイトル

```typescript
    <XStack alignItems="center" gap="$2">
            <ClipboardPen size={36} />
            <H1
              fontSize={36}
              color="$primary"
              letterSpacing={2}
              fontWeight="400"
            >
            {i18n.t("AddDiary")}
        </H1>
    </XStack>
<Separator alignSelf="stretch" borderColor={"$color"} />

```

## card

```typescript
<Card
                bordered
                padding="$4"
                width="100%"
                pressStyle={{ scale: 0.97 }}
              >
```

# API

##

```typescript
useEffect(() => {
  const fetch = async () => {
    try {
      const res7 = await fertPestApiClient.fertilizers.$get({
        query: { query: fertilizerInput },
      });
      if (!res7.ok) return;
      const json7 = await res7.json();
      if (!json7) return;
      setFertilizers(json7);
      const res8 = await fertPestApiClient.fertilizers[":id"].$get({
        param: { id: "輸第7607号" },
      });
      if (!res8.ok) return;
      const json8 = await res8.json();
      if (!json8) return;
      console.log(json8);
    } catch (e) {
      console.error(e);
    }
  };
  fetch();
}, [fertilizerInput]);
```

```typescript
useEffect(() => {
  console.log(fertilizers);
}, [fertilizers]);

useEffect(() => {
  const fetch = async () => {
    const res = await (
      await client()
    ).api.diaries.$post({
      json: {
        groupId: 1,
        diaryPackId: 1,
        pesticideRegistrationNumber: "123456789012",
        fertilizerRegistrationNumber: "123456789012",
        pesticideAmount: 1,
        fertilizerAmount: 1,
        workerId: "xdumPg9v0Wws6db8D8gtdGU6gePh",
        registrerId: "xdumPg9v0Wws6db8D8gtdGU6gePh",
        weatherId: "template-1",
        taskId: "template-1",
        datetime: "2024-01-01T00:00:00+09:00",
        type: "record",
        note: "note",
      },
    });
  };
  fetch();
}, [refresh]);
```

```typescript
<Controller
                      name="taskId"
                      rules={{ required: "必須項目です" }}
                      control={control}
                      render={({ field: { onChange, value }, fieldState }) => {
                        return (
                          <>
                            <Select
                              options={diaryTaskTypes.map((task) => ({
                                label: task.name,
                                value: task.id,
                              }))}
                              selectedValue={
                                value as string | number | undefined
                              }
                              onValueChange={(
                                selectedValue: string | number,
                              ) => {

                                onChange(selectedValue);
                              }}
                            />
                            {fieldState.error && (
                              <Text style={{ color: "red", fontSize: 12 }}>
                                {fieldState.error.message}
                              </Text>
                            )}
                          </>
                        );
                      }}
                    />
```

作業者名とIdのリストを手に入れたい
->

<SizableText>
            {groupName} {userName} さん、こんにちは！
          </SizableText>
          {emailVerified === false && (
            <Card margin="$3">
              <Card.Header padding="0" paddingBlock="$3" paddingHorizontal="$4">
                <XStack gap="$3" alignItems="center">
                  <MailWarning />
                  <SizableText size="$6">{i18n.t("important")}</SizableText>
                </XStack>
              </Card.Header>
              <YStack marginHorizontal="$10" marginBottom="$3" zIndex={100}>
                <SizableText>{i18n.t("pleaseVerifyEmail")}</SizableText>
                <Button onPress={() => router.push("/signup/verifyEmail")}>
                  {i18n.t("verifyEmail")}
                </Button>
              </YStack>
              <Card.Background
                style={{
                  backgroundColor: "rgb(147 114 220)",
                  borderRadius: 15,
                }}
              />
            </Card>
          )}
          <Stack marginHorizontal="$8" marginVertical="$2">
            <Weather></Weather>
          </Stack>
          <Stack marginHorizontal="$8" marginVertical="$2">
            <DiaryList></DiaryList>
          </Stack>
          <Link href="/navigation">
            <ThemedText>ナビゲーション画面へ</ThemedText>
          </Link>
          <Link href="/(tabs)/settings">
            <ThemedText>アカウント設定画面へ</ThemedText>
          </Link>
