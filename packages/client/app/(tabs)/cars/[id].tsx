import { zodResolver } from "@hookform/resolvers/zod";
import { carSchema } from "backend/src/schema/car";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Button, Input, Label, ScrollView, SizableText } from "tamagui";
import { z } from "zod";

import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";
// import { logger } from "@/lib/logger";

const formSchema = carSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  groupId: true,
});

export default function Detail() {
  const params = useLocalSearchParams<{ id: string }>();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  if (Object.keys(errors).length > 0) {
    console.error(errors);
  }

  const [successMessage, setSuccessMessage] = React.useState("");
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log(data);
    // logger.write({ message: "Change the car", ...data });
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await (
        await client()
      ).api.cars[":id"].$patch({
        param: { id: parseInt(params.id) },
        json: data,
      });
      if (!res.ok) {
        setErrorMessage("Failed to update car: " + (await res.text()));
        return;
      }
      setSuccessMessage("OK!");
      setRefresh(true);
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to update car");
    }
  };

  const [errorMessage, setErrorMessage] = React.useState("");
  const [refresh, setRefresh] = React.useState(false);
  useEffect(() => {
    (async () => {
      const res = await (
        await client()
      ).api.cars[":id"].$get({
        param: { id: parseInt(params.id) },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (!json) return;
      setValue("name", json.name);
      setValue("width", json.width);
      setValue("length", json.length);
      setValue("height", json.height);
      setValue("antenna_x_offset", json.antenna_x_offset);
      setValue("antenna_y_offset", json.antenna_y_offset);
      setValue("antenna_z_offset", json.antenna_z_offset);

      setRefresh(false);
    })();
  }, [refresh, params.id]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <ScrollView margin="$3">
        <SizableText>Detail</SizableText>
        <Label>{i18n.t("name")}</Label>
        <Controller
          control={control}
          render={({ field }) => (
            <Input value={field.value} onChangeText={field.onChange} />
          )}
          name="name"
        />
        {errors.name && (
          <SizableText color="red">{errors.name.message}</SizableText>
        )}
        <Label>{i18n.t("CarWidth")}</Label>
        <Controller
          control={control}
          render={({ field }) => (
            <Input
              value={String(field.value)}
              onChangeText={(v) => field.onChange(parseInt(v) || v)}
            />
          )}
          name="width"
        />
        {errors.width && (
          <SizableText color="red">{errors.width.message}</SizableText>
        )}
        <Label>{i18n.t("length")}</Label>
        <Controller
          control={control}
          render={({ field }) => (
            <Input
              value={String(field.value)}
              onChangeText={(v) => field.onChange(parseInt(v) || v)}
            />
          )}
          name="length"
        />
        {errors.length && (
          <SizableText color="red">{errors.length.message}</SizableText>
        )}
        <Label>{i18n.t("height")}</Label>
        <Controller
          control={control}
          render={({ field }) => (
            <Input
              value={String(field.value)}
              onChangeText={(v) => field.onChange(parseInt(v) || v)}
            />
          )}
          name="height"
        />
        {errors.height && (
          <SizableText color="red">{errors.height.message}</SizableText>
        )}
        <Label>{i18n.t("CarForwardDistance")}</Label>
        <Controller
          control={control}
          render={({ field }) => (
            <Input
              value={String(field.value)}
              onChangeText={(v) => field.onChange(parseInt(v) || v)}
            />
          )}
          name="antenna_x_offset"
        />
        {errors.antenna_x_offset && (
          <SizableText color="red">
            {errors.antenna_x_offset.message}
          </SizableText>
        )}
        <Label>{i18n.t("CarLeftDistance")}</Label>
        <Controller
          control={control}
          render={({ field }) => (
            <Input
              value={String(field.value)}
              onChangeText={(v) => field.onChange(parseInt(v) || v)}
            />
          )}
          name="antenna_y_offset"
        />
        {errors.antenna_y_offset && (
          <SizableText color="red">
            {errors.antenna_y_offset.message}
          </SizableText>
        )}
        <Label>{i18n.t("CarGroundDistance")}</Label>
        <Controller
          control={control}
          render={({ field }) => (
            <Input
              value={String(field.value)}
              onChangeText={(v) => field.onChange(parseInt(v) || v)}
            />
          )}
          name="antenna_z_offset"
        />
        {errors.antenna_z_offset && (
          <SizableText color="red">
            {errors.antenna_z_offset.message}
          </SizableText>
        )}
        {errorMessage && <SizableText color="red">{errorMessage}</SizableText>}
        {successMessage && (
          <SizableText color="green">{successMessage}</SizableText>
        )}
        <Button
          backgroundColor="$accentBackground"
          onPress={handleSubmit(onSubmit)}
        >
          {i18n.t("submit")}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
