import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TimePickerModal } from "react-native-paper-dates";
import { DatePickerInput } from "react-native-paper-dates";
import { ja, registerTranslation } from "react-native-paper-dates";
import { Button, Input, Sheet, SizableText, XStack, YStack } from "tamagui";
import { z, ZodString } from "zod";

import Select from "@/components/Select";
import i18n from "@/lib/i18n";

registerTranslation("ja", ja);
dayjs.extend(utc);
dayjs.extend(timezone);

type Option = {
  label: string;
  value: number | string;
};

type UpdateModalProps =
  | {
      type: "input";
      open: boolean;
      label: string;
      value: string;
      schema: z.ZodString | z.ZodNumber | z.ZodNullable<z.ZodString>;
      secureTextEntry?: boolean;
      errorMessage?: string;
      submitFunc: (input: string | number) => void;
      closeModal: () => void;
    }
  | {
      type: "select";
      open: boolean;
      label: string;
      options: Option[];
      value: number | string;
      schema:
        | z.ZodUnion<[z.ZodString, ...z.ZodString[]]>
        | z.ZodEnum<[string, ...string[]]>
        | z.ZodEffects<ZodString, string, string>
        | z.ZodString
        | z.ZodNumber;
      errorMessage?: string;
      submitFunc: (selected: number | string) => void;
      closeModal: () => void;
    }
  | {
      type: "date";
      open: boolean;
      label: string;
      value: string;
      schema: z.ZodString;
      errorMessage?: string;
      submitFunc: (input: string) => void;
      closeModal: () => void;
    };

export function UpdateModal(props: UpdateModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    props.errorMessage,
  );
  const schema = z.object({ input: props.schema });
  const {
    formState: { errors },
    handleSubmit,
    setValue,
    control,
    reset,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    setTimeout(() => {
      reset({ input: props.value });
    }, 100);
  }, [props.open]);

  useEffect(() => {
    setErrorMessage(props.errorMessage);
  }, [props.errorMessage]);

  useEffect(() => {
    setValue("input", props.value);
  }, [props.value]);

  // time
  const [visible, setVisible] = useState(false);

  return (
    <Sheet
      modal
      open={props.open}
      snapPoints={[100]}
      snapPointsMode="percent"
      animation="200ms"
      disableDrag
    >
      <Sheet.Frame>
        <YStack padding="$5" gap="$1">
          <SizableText size="$5">{props.label}</SizableText>
          <Controller
            name="input"
            control={control}
            defaultValue={props.value}
            render={({ field }) =>
              props.type === "select" ? (
                <Select
                  options={props.options}
                  selectedValue={field.value ?? undefined}
                  onValueChange={(val) => field.onChange(val)}
                />
              ) : props.type === "input" ? (
                <Input
                  secureTextEntry={
                    props.type === "input" ? props.secureTextEntry : undefined
                  }
                  value={field.value?.toString() || ""}
                  onChangeText={(val) => field.onChange(val)}
                />
              ) : (
                <YStack alignItems="center" gap="$8">
                  <DatePickerInput
                    locale="ja"
                    label={i18n.t("workingDate")}
                    value={new Date(field.value?.toString() || new Date())}
                    onChange={(d) => {
                      if (d) {
                        field.onChange(
                          dayjs(field.value)
                            .set("year", d.getFullYear())
                            .set("month", d.getMonth())
                            .set("date", d.getDate())
                            .tz()
                            .format(),
                        );
                      }
                    }}
                    inputMode="start"
                  />
                  <Button onPress={() => setVisible(true)}>
                    <SizableText>
                      {dayjs(field.value).hour() ?? "--"}:
                      {dayjs(field.value).minute() ?? "--"}
                    </SizableText>
                  </Button>
                  <TimePickerModal
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    onConfirm={(val) => {
                      field.onChange(
                        dayjs(field.value)
                          .set("hour", val.hours)
                          .set("minute", val.minutes)
                          .tz()
                          .format(),
                      );
                      setVisible(false);
                    }}
                    hours={dayjs(field.value).hour()}
                    minutes={dayjs(field.value).minute()}
                  />
                </YStack>
              )
            }
          />
          {errors.input && (
            <SizableText size="$2">{errors.input.message}</SizableText>
          )}
          {errorMessage && <SizableText size="$2">{errorMessage}</SizableText>}
          <XStack paddingTop="$3" gap="$5" justifyContent="center">
            <Button onPress={props.closeModal}>{i18n.t("cancel")}</Button>
            <Button
              onPress={handleSubmit((val) => {
                if (props.type === "date") {
                  if (typeof val.input === "string") {
                    props.submitFunc(val.input);
                  } else {
                    console.error("invalid date");
                    console.debug(val.input);
                  }
                } else {
                  props.submitFunc(val.input || "");
                }
              })}
            >
              {i18n.t("save")}
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
