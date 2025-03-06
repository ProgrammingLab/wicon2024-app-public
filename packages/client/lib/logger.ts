import RNFS from "react-native-fs";

export type SystemLog = {
  message: string;
  [key: string]: unknown;
};
export type NavLog = {
  timestamp: number;
  selectedLine: {
    start: {
      lon: number;
      lat: number;
    };
    end: {
      lon: number;
      lat: number;
    };
  };
  current: {
    lon: number;
    lat: number;
  };
  deviation: number;
  carPosition: "RIGHT" | "LEFT" | "ON";
  displayedCarPosition: "RIGHT" | "LEFT" | "ON";
};

class Logger {
  systemLog: SystemLog[] = [];
  navLog: NavLog[] = [];
  systemLogPath: string;
  navLogPath: string;
  cycle: Timer;

  constructor() {
    this.systemLogPath =
      RNFS.DocumentDirectoryPath + "/sys" + Date.now() + ".jsonl";
    this.navLogPath = RNFS.DocumentDirectoryPath + "/nav" + Date.now() + ".csv";

    this.cycle = setInterval(() => {
      this.flush();
    }, 10000);
  }

  write(data: SystemLog) {
    this.systemLog.push(data);
  }

  writeNavi(data: NavLog) {
    this.navLog.push(data);
  }

  stop() {
    clearInterval(this.cycle);
  }

  restart() {
    this.systemLog = [];
    this.navLog = [];
    clearInterval(this.cycle);
    this.cycle = setInterval(() => {
      this.flush();
    }, 10000);
  }

  cut() {
    this.systemLogPath =
      RNFS.DocumentDirectoryPath + "/sys" + Date.now() + ".jsonl";
    this.navLogPath = RNFS.DocumentDirectoryPath + "/nav" + Date.now() + ".csv";
  }

  flush() {
    if (this.systemLog.length) {
      const rawLogs: string[] = this.systemLog.map((i) => JSON.stringify(i));
      const rawData: string = rawLogs.join("\n") + "\n";
      RNFS.appendFile(this.systemLogPath, rawData);
      console.log("ENTER");
      console.log(RNFS.DocumentDirectoryPath);
      RNFS.readFile(this.systemLogPath).then((data) => {
        console.log(data);
      });
      this.systemLog = [];
    }

    if (this.navLog.length) {
      const rawLogs: string[] = this.navLog.map((i) =>
        [
          i.timestamp,
          i.selectedLine.start.lon,
          i.selectedLine.start.lat,
          i.selectedLine.end.lon,
          i.selectedLine.end.lat,
          i.current.lon,
          i.current.lat,
          i.deviation,
          i.carPosition,
          i.displayedCarPosition,
        ].join(","),
      );
      const rawData: string = rawLogs.join("\n") + "\n";
      RNFS.appendFile(this.navLogPath, rawData);
      this.navLog = [];
    }
  }

  async getLogFiles(): Promise<RNFS.ReadDirItem[]> {
    const result = await RNFS.readDir(RNFS.DocumentDirectoryPath);
    return result.filter(
      (i) => i.name.startsWith("sys") || i.name.startsWith("nav"),
    );
  }
}

export const logger = new Logger();
