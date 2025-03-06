import * as Location from "expo-location";
import React from "react";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import {
  Image,
  ScrollView,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

import cloudyDark from "@/assets/images/weather/cloudy-dark.png";
import cloudyLight from "@/assets/images/weather/cloudy-light.png";
import rainyDark from "@/assets/images/weather/rainy-dark.png";
import rainyLight from "@/assets/images/weather/rainy-light.png";
import snowyDark from "@/assets/images/weather/snowy-dark.png";
import snowyLight from "@/assets/images/weather/snowy-light.png";
import sunnyDark from "@/assets/images/weather/sunny-dark.png";
import sunnyLight from "@/assets/images/weather/sunny-light.png";
import i18n from "@/lib/i18n";
import {
  isPrecipitation,
  ShortForecast,
  WeatherForecast,
  WeatherType,
} from "@/lib/weatherReport";

// 共通のインターフェース
interface Coord {
  lon: number;
  lat: number;
}

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Clouds {
  all: number;
}

interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

// ---------------------
// 現在の天気データ用の型
// ---------------------
interface CurrentWeather {
  coord: Coord;
  weather: Weather[];
  base: string;
  main: Main;
  visibility: number;
  wind: Wind;
  rain: RainCurrent;
  clouds: Clouds;
  dt: number;
  sys: Sys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

interface Main {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level: number;
  grnd_level: number;
}

interface Sys {
  type: number;
  id: number;
  country: string;
  sunrise: number;
  sunset: number;
}

interface RainCurrent {
  "1h": number;
}

// ---------------------
// 予報データ用の型
// ---------------------
interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: City;
}

interface ForecastItem {
  dt: number;
  main: ForecastMain;
  weather: Weather[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  rain: RainForecast;
  sys: ForecastSys;
  dt_txt: string;
}

interface ForecastMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
}

interface ForecastSys {
  pod: string;
}

interface RainForecast {
  "3h": number;
}

interface City {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

interface ForecastEntry {
  firstDay: string[]; // 予報対象期間の初めの日付
  lastDay: string[]; // 予報対象期間終わりの日付
  numberOfDays: number[]; // 予報対象期間の日数
  temp: number[]; // 予測値（℃）
  lastY: number[]; // 昨年の実況値（℃）
  last10Y: number[]; // 過去10年の平均値（℃）
  normal: number[]; // 平年値（℃）
}

interface MonthForecast {
  forecast1: ForecastEntry; // １か月予報
  forecast2: ForecastEntry; // forecast1 の最初の1週間の予報
  forecast3: ForecastEntry; // forecast2 の次の1週間の予報
  forecast4: ForecastEntry; // forecast3 の次の2週間の予報
}

const WEATHER_KEY = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY;

export default function Weather() {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lon: number;
    lat: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      function parseWeather(id: number): WeatherType {
        if (id === 800) return "sunny";
        const top = Math.floor(id / 100);
        switch (top) {
          case 2:
          case 3:
          case 5:
            return "rainy";
          case 6:
            return "snowy";
          default:
            return "cloudy";
        }
      }

      function round(temp: number): number {
        return Math.round(temp * 10) / 10;
      }

      let location: { lon: number; lat: number };

      if (userLocation === null) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          Location.getCurrentPositionAsync({}).then((data) => {
            setUserLocation({
              lon: data.coords.longitude,
              lat: data.coords.latitude,
            });
          });
        }
        location = { lat: 35.713746, lon: 139.762692 };
      } else {
        location = userLocation;
      }
      console.log(location);

      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${WEATHER_KEY}&lang=ja`,
      );
      if (!currentRes.ok) {
        console.error(currentRes);
      }
      const current = (await currentRes.json()) as CurrentWeather;

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${WEATHER_KEY}&lang=ja`,
      );
      if (!forecastRes.ok) {
        console.error(forecastRes);
      }
      const forecast = (await forecastRes.json()) as ForecastResponse;

      // TODO: 東京以外で月予報を得る
      const monthRes = await fetch(
        `https://api.cultivationdata.net/onemonth?no=${47662}`,
      );
      if (!monthRes.ok) {
        console.error(monthRes);
      }
      const monthForecast = (await monthRes.json()) as MonthForecast;

      const difference =
        monthForecast.forecast1.temp[0] - monthForecast.forecast1.last10Y[0];
      let comparedToNormalYear: "hot" | "same" | "cold";
      if (difference < -0.3) {
        comparedToNormalYear = "cold";
      } else if (0.3 < difference) {
        comparedToNormalYear = "hot";
      } else {
        comparedToNormalYear = "same";
      }

      const timezone = forecast.city.timezone;

      setForecast({
        location: current.name,
        celsiusTemperature: {
          max: round(current.main.temp_max - 273.15),
          min: round(current.main.temp_min - 273.15),
          now: round(current.main.temp - 273.15),
        },
        weatherNow: parseWeather(current.weather[0].id),
        hourlyForecast: forecast.list
          .filter((value, index) => index < 12)
          .map((value) => {
            const date = new Date(value.dt_txt);
            date.setSeconds(date.getSeconds() + timezone);
            return {
              date,
              chanceOfRain: value.pop * 100,
              weather: parseWeather(value.weather[0].id),
              celsiusTemperature: round(value.main.temp - 273.15),
            };
          }),
        dailyForecast: forecast.list
          .filter((value, index) => index % 8 === 0)
          .map((value) => {
            const date = new Date(value.dt_txt);
            date.setSeconds(date.getSeconds() + timezone);
            return {
              date,
              chanceOfRain: value.pop * 100,
              weather: parseWeather(value.weather[0].id),
              celsiusTemperature: round(value.main.temp - 273.15),
            };
          }),
        monthlyForecast: {
          difference,
          comparedToNormalYear,
        },
      });
    })();
  }, [userLocation]);

  return (
    <XStack h="$16" jc="center">
      {!forecast && (
        <View
          jc="center"
          ai="center"
          backgroundColor="$accentBackground"
          h="100%"
          w="100%"
          borderRadius="$4"
          m="$1"
        >
          <Spinner size="large" />
        </View>
      )}
      {forecast && <CurrentCard forecast={forecast}></CurrentCard>}
      {forecast && (
        <FutureCard
          forecast={forecast}
          shortForecasts={forecast.hourlyForecast}
          unit="hour"
        ></FutureCard>
      )}
      {forecast && (
        <FutureCard
          forecast={forecast}
          shortForecasts={forecast.dailyForecast}
          unit="day"
        ></FutureCard>
      )}
      {forecast && <ComparingCard forecast={forecast}></ComparingCard>}
    </XStack>
  );
}

type CurrentCardProps = {
  forecast: WeatherForecast;
};

type FutureCardProps = {
  forecast: WeatherForecast;
  shortForecasts: ShortForecast[];
  unit: "hour" | "day";
};

type ComparingCardProps = {
  forecast: WeatherForecast;
};

function CurrentCard({ forecast }: CurrentCardProps) {
  return (
    <YStack
      m="$1"
      bg="$accentBackground"
      h="100%"
      w="$16"
      borderRadius="$4"
      ai="center"
      jc="center"
    >
      <Text fontSize="$6">{forecast.location}</Text>
      <XStack ai="center">
        <Image
          source={WeatherToSource(forecast.weatherNow)}
          h={20}
          w={20}
          mr="$1.5"
        ></Image>
        <Text fontSize="$8">{i18n.t(forecast.weatherNow)}</Text>
      </XStack>
      <Text fontSize="$12" lineHeight="$11">
        {forecast.celsiusTemperature.now}℃
      </Text>
      <XStack w="100%" jc="center">
        <YStack mr="$3">
          <Text fontSize="$8">{i18n.t("max")}</Text>
          <Text fontSize="$9">{forecast.celsiusTemperature.max}℃</Text>
        </YStack>
        <YStack>
          <Text fontSize="$8">{i18n.t("min")}</Text>
          <Text fontSize="$9">{forecast.celsiusTemperature.min}℃</Text>
        </YStack>
      </XStack>
    </YStack>
  );
}
function FutureCard({ forecast, shortForecasts, unit }: FutureCardProps) {
  let nextWeather:
    | {
        weather: WeatherType;
        untilWeatherChange: number;
      }
    | "never" = "never";
  for (let i = 0; i < shortForecasts.length; i++) {
    if (
      isPrecipitation(shortForecasts[i].weather) ===
      isPrecipitation(forecast.weatherNow)
    ) {
      continue;
    }

    const now = new Date();
    const untilWeatherChangeMillSeconds =
      shortForecasts[i].date.getTime() - now.getTime();
    if (unit === "hour") {
      nextWeather = {
        weather: shortForecasts[i].weather,
        untilWeatherChange: Math.round(untilWeatherChangeMillSeconds / 3600000),
      };
    } else {
      nextWeather = {
        weather: shortForecasts[i].weather,
        untilWeatherChange: Math.round(
          untilWeatherChangeMillSeconds / 86400000,
        ),
      };
    }
    break;
  }

  let nextWeatherText = "";
  if (nextWeather === "never") {
    nextWeatherText = i18n.t("The weather won't change for a while");
  } else {
    if (i18n.locale === "en") {
      nextWeatherText = `It will be ${nextWeather.weather} in ${nextWeather.untilWeatherChange} ${unit}`;
      if (nextWeather.untilWeatherChange > 1) nextWeatherText += "s";
    } else if (i18n.locale === "ja") {
      nextWeatherText = `${nextWeather.untilWeatherChange}${i18n.t(unit)}後に${i18n.t(nextWeather.weather)}の予報です`;
    }
  }

  return (
    <ScrollView
      w={320}
      m="$1"
      bg="$accentBackground"
      h="100%"
      borderRadius="$4"
      pt="$3"
    >
      <YStack h="100%" w="100%" ai="center" mb="$8">
        <Text fontSize={nextWeather === "never" ? "$7" : "$8"} mb="$2">
          {nextWeatherText}
        </Text>
        <View h="100%" w="100%">
          {shortForecasts.map((value) => {
            let timeText = "";
            if (unit === "hour") {
              if (i18n.locale === "en") {
                timeText += value.date.getHours() % 12;
              } else if (i18n.locale === "ja") {
                timeText += value.date.getHours();
              }
            } else {
              timeText += value.date.getDate();
            }
            let unitText = "";

            if (unit === "hour") {
              if (i18n.locale === "en") {
                if (value.date.getHours() < 12) {
                  unitText = "AM";
                } else {
                  unitText = "PM";
                }
              } else if (i18n.locale === "ja") {
                unitText = "時";
              }
            } else {
              if (i18n.locale === "en") {
                switch (value.date.getDate()) {
                  case 1:
                  case 21:
                  case 31:
                    unitText = "TH";
                    break;
                  case 2:
                  case 22:
                    unitText = "ND";
                    break;
                  case 3:
                  case 23:
                    unitText = "RD";
                    break;
                  default:
                    unitText = "TH";
                }
              } else if (i18n.locale === "ja") {
                unitText = "日";
              }
            }

            return (
              <XStack key={value.date.getTime()} jc="space-between" w="100%">
                <Text w="20%" fontSize="$7" ta="right" pr="$3">
                  {timeText}
                  <Text fontSize="$4">{unitText}</Text>
                </Text>
                <Text w="20%" fontSize="$7" ta="right" pr="$3">
                  {value.chanceOfRain}
                  <Text fontSize="$5">%</Text>
                </Text>
                <XStack w="35%" ai="center" pl="$4">
                  <Image
                    source={WeatherToSource(value.weather)}
                    h={20}
                    w={20}
                    mr="$1.5"
                  ></Image>
                  <Text fontSize="$7">{i18n.t(value.weather)}</Text>
                </XStack>
                <Text w="25%" fontSize="$7" ta="right" pr="$6">
                  {value.celsiusTemperature}
                  <Text fontSize="$5">℃</Text>
                </Text>
              </XStack>
            );
          })}
        </View>
      </YStack>
    </ScrollView>
  );
}
function ComparingCard({ forecast }: ComparingCardProps) {
  let longForecastText = "";
  switch (forecast.monthlyForecast.comparedToNormalYear) {
    case "hot":
      longForecastText = i18n.t("Hotter");
      break;
    case "same":
      longForecastText = i18n.t("As Usual");
      break;
    case "cold":
      longForecastText = i18n.t("Colder");
      break;
  }

  return (
    <YStack
      m="$1"
      bg="$accentBackground"
      h="100%"
      w="$16"
      borderRadius="$4"
      ai="center"
      jc="center"
    >
      <Text fontSize="$7">{i18n.t("Compared to average")}</Text>
      <Text fontSize="$10">
        {Math.round(forecast.monthlyForecast.difference * 10) / 10}℃
      </Text>
      <Text fontSize="$7">{i18n.t("Long Range Forecast")}</Text>
      <Text fontSize="$10">{longForecastText}</Text>
    </YStack>
  );
}

function WeatherToSource(weather: WeatherType) {
  const colorScheme = useColorScheme();
  if (colorScheme === "dark") {
    switch (weather) {
      case "sunny":
        return sunnyDark;
      case "cloudy":
        return cloudyDark;
      case "rainy":
        return rainyDark;
      case "snowy":
        return snowyDark;
    }
  } else {
    switch (weather) {
      case "sunny":
        return sunnyLight;
      case "cloudy":
        return cloudyLight;
      case "rainy":
        return rainyLight;
      case "snowy":
        return snowyLight;
    }
  }
}
