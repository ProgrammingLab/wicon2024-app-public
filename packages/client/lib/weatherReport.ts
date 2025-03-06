export type WeatherForecast = {
  location: string;
  celsiusTemperature: {
    now: number;
    max: number;
    min: number;
  };
  weatherNow: WeatherType;
  hourlyForecast: ShortForecast[];
  dailyForecast: ShortForecast[];
  // normalYear: {
  //   celsiusTemperature: number;
  // };
  monthlyForecast: {
    difference: number;
    comparedToNormalYear: "hot" | "same" | "cold";
  };
};

export type WeatherType = "sunny" | "cloudy" | "rainy" | "snowy";

export type ShortForecast = {
  date: Date;
  chanceOfRain: number;
  weather: WeatherType;
  celsiusTemperature: number;
};

export async function getDummyForecast(): Promise<WeatherForecast> {
  let time = new Date();
  const hourlyForecast: ShortForecast[] = [];
  for (let i = 0; i < 12; i++) {
    time.setHours(time.getHours() + 1);
    const weather: WeatherType = getRandomWeather();
    hourlyForecast.push({
      date: new Date(time.getTime()),
      chanceOfRain: Math.floor(Math.random() * 11) * 10,
      weather,
      celsiusTemperature: (Math.floor(Math.random() * 500) - 10) / 10.0,
    });
  }

  time = new Date();
  const dailyForecast: ShortForecast[] = [];
  for (let i = 0; i < 7; i++) {
    time.setDate(time.getDate() + 1);
    const weather: WeatherType = getRandomWeather();
    dailyForecast.push({
      date: new Date(time.getTime()),
      chanceOfRain: Math.floor(Math.random() * 11) * 10,
      weather,
      celsiusTemperature: (Math.floor(Math.random() * 500) - 10) / 10.0,
    });
  }

  return {
    location: "久留米市",
    celsiusTemperature: {
      now: (Math.floor(Math.random() * 500) - 10) / 10.0,
      max: (Math.floor(Math.random() * 500) - 10) / 10.0,
      min: (Math.floor(Math.random() * 500) - 10) / 10.0,
    },
    weatherNow: getRandomWeather(),
    hourlyForecast,
    dailyForecast,
    monthlyForecast: {
      difference: (Math.floor(Math.random() * 500) - 10) / 10.0,
      comparedToNormalYear: getRandomCompared(),
    },
  };
}

export function isPrecipitation(weather: WeatherType) {
  switch (weather) {
    case "sunny":
    case "cloudy":
      return false;
    case "rainy":
    case "snowy":
      return true;
  }
}

function getRandomWeather(): WeatherType {
  switch (Math.floor(Math.random() * 4)) {
    case 0:
      return "sunny";
    case 1:
      return "cloudy";
    case 2:
      return "rainy";
    case 3:
      return "snowy";
  }
  return "cloudy";
}

function getRandomCompared(): "hot" | "same" | "cold" {
  switch (Math.floor(Math.random() * 3)) {
    case 0:
      return "hot";
    case 1:
      return "same";
    case 2:
      return "cold";
  }
  return "hot";
}
