# 大会に向けて

1. モックデータをまともにする
2. スマホに対応させる(BADUI直し直し)
3. ホーム画面
4. MAPから日誌選択
5. EXCEL出すやつ

# **_要望(2/21)_** は今後の展望になりました

- 肥料API
  - 過去の日誌を見る所では作業内容に合わせて(消毒なら農薬量)表示させてほしい
- 気温変化を折れ線グラフで欲しい（播種から収穫まで）

size="$3"
fontSize="$8"

            </YStack>

            <YStack alignItems="center">






            height="95%"

```
              {/* 肥料（肥料名/使用量） */}
              <YGroup.Item>
                <ListItem
                  hoverTheme
                  title={
                    <XStack alignItems="center" gap="$4">
                      <ReceiptText size="$3" strokeWidth={1.5} />
                      <Text fontSize="$8" fontWeight={400}>
                        {i18n.t("fertilizers")}
                      </Text>
                    </XStack>
                  }
                  iconAfter={
                    <YStack alignItems="flex-end" gap="$4" width={400}>
                      <Controller
                        name="fertilizerInput"
                        control={control}
                        render={({ field, fieldState }) => (
                          <YStack gap="$2">
                            <XStack gap="$2">
                              {/* 候補リストの表示 */}
                              {fertilizerSuggestions.length > 0 && (
                                <FlatList
                                  data={fertilizerSuggestions}
                                  keyExtractor={(item, index) =>
                                    `${item.登録番号}-${index}`
                                  }
                                  renderItem={({ item }) => (
                                    <TouchableOpacity
                                      onPress={() => {
                                        setFertilizerSearch(item.登録番号);
                                        setFertilizerSuggestions([]);
                                        field.onChange(item.登録番号);
                                      }}
                                    >
                                      <ListItem>{item.肥料の名称}</ListItem>
                                    </TouchableOpacity>
                                  )}
                                />
                              )}
                              <Input
                                width="$20"
                                borderWidth="$1"
                                placeholder={"肥料登録番号"}
                                id={`fertilizerInput-${field.name}`}
                                value={field.value}
                                onChangeText={(value) => {
                                  field.onChange(value);
                                  setFertilizerSearch(value);
                                }}
                                onBlur={field.onBlur}
                              />
                              {fieldState.error && (
                                <Text color="$red10">
                                  {fieldState.error.message}
                                </Text>
                              )}
                            </XStack>
                          </YStack>
                        )}
                      />
                      <Controller
                        name="fertilizerAmount"
                        control={control}
                        render={({ field, fieldState }) => (
                          <YStack space="$2">
                            <Input
                              width="$20"
                              borderWidth="$1"
                              placeholder={"肥料散布量"}
                              id={`fertilizerAmount-${field.name}`}
                              value={
                                field.value === 0 ? "" : field.value?.toString()
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
                          </YStack>
                        )}
                      />
                    </YStack>
                  }
                  size="$5"
                />
              </YGroup.Item>
```
