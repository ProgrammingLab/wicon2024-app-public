import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Input, Sheet, SizableText, XStack, YStack } from "tamagui";
import { z } from "zod";

import Select from "@/components/Select";
import i18n from "@/lib/i18n";

type Option = {
  label: string;
  value: string | number;
};

type UpdateModalProps =
  | {
      type: "input";
      open: boolean;
      label: string;
      value: string | number;
      schema: z.ZodString | z.ZodNumber | z.ZodNullable<z.ZodString>;
      secureTextEntry?: boolean;
      errorMessage?: string;
      submitFunc: (input: string) => void;
      closeModal: () => void;
    }
  | {
      type: "select";
      open: boolean;
      label: string;
      options: Option[];
      value: string | number;
      schema:
        | z.ZodEnum<[string, ...string[]]>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | z.ZodNativeEnum<any>
        | z.ZodString;
      errorMessage?: string;
      submitFunc: (selected: string) => void;
      closeModal: () => void;
    };

export function UpdateModal(props: UpdateModalProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    props.errorMessage,
  );
  const schema = z.object({ input: props.schema });
  const {
    formState: { errors },
    handleSubmit,
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

  return (
    <>
      <Sheet
        modal
        open={props.open}
        snapPoints={[100]}
        snapPointsMode="percent"
        animation="200ms"
      >
        <Sheet.Frame>
          <YStack padding="$5" gap="$1">
            <SizableText size="$5">{props.label}</SizableText>
            <Controller
              name="input"
              control={control}
              defaultValue={props.value}
              render={({ field }) => (
                <>
                  {props.type === "select" ? (
                    <Select
                      options={props.options}
                      selectedValue={field.value || ""}
                      onValueChange={(val) => field.onChange(val.toString())}
                    />
                  ) : (
                    <>
                      {typeof props.value === "number" ? (
                        <Input
                          secureTextEntry={props.secureTextEntry}
                          value={field.value?.toString()}
                          onChangeText={(val) => field.onChange(parseInt(val))}
                        />
                      ) : (
                        <Input
                          secureTextEntry={props.secureTextEntry}
                          value={field.value?.toString()}
                          onChangeText={field.onChange}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            />
            {errors.input && (
              <SizableText size="$2">{errors.input.message}</SizableText>
            )}
            {errorMessage && (
              <SizableText size="$2">{errorMessage}</SizableText>
            )}
            <XStack paddingTop="$3" gap="$5" justifyContent="center">
              <Button onPress={props.closeModal}>{i18n.t("cancel")}</Button>
              <Button
                onPress={handleSubmit((val) =>
                  props.submitFunc(val["input"]?.toString() || ""),
                )}
              >
                {i18n.t("save")}
              </Button>
            </XStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
