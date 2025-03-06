import * as net from "net";
import base64 from "react-native-base64";

export type NtripClientState =
  | "connecting"
  | "connected"
  | Date
  | "disconnected"
  | "re-connecting";

export class NtripClient {
  private socket: net.Socket;
  private onNtripClientStateChange: (state: NtripClientState) => void;
  private wantDisconnect: boolean = false;

  constructor(onNtripClientStateChange: (state: NtripClientState) => void) {
    this.onNtripClientStateChange = onNtripClientStateChange;
    this.socket = new net.Socket();
  }

  private createConnection(
    host: string,
    port: number,
    mountPoint: string,
    username?: string,
    password?: string,
  ) {
    this.socket = net.createConnection(
      {
        port,
        host,
      },
      async () => {
        console.log("called");
        console.log("readyState", this.socket.readyState);
        while (this.socket.readyState !== "open") {
          console.log(
            "Waiting for connection to be open. Now it is",
            this.socket.readyState,
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (username && password) {
          this.socket.write(
            `GET /${mountPoint} HTTP/1.1\r\nHost: ${host}:${port}\r\nAuthorization: Basic ${base64.encode(`${username}:${password}`)}\r\nUser-Agent: NTRIP ntripClient\r\nAccept: */*\r\n\r\n`,
          );
        } else {
          this.socket.write(
            `GET /${mountPoint} HTTP/1.1\r\nHost: ${host}:${port}\r\nUser-Agent: NTRIP ntripClient\r\nAccept: */*\r\n\r\n`,
          );
        }
        console.log("Sent a GET method");
        this.onNtripClientStateChange("connected");
      },
    );

    this.socket.on("error", (error) => {
      console.log("basestation error", error);
    });
    this.socket.on("close", () => {
      console.log("Connection closed!");
      this.socket.destroy();
      this.onNtripClientStateChange("disconnected");

      if (!this.wantDisconnect) {
        this.reconnect(host, port, mountPoint, username, password);
      }
    });
  }

  private reconnect(
    host: string,
    port: number,
    mountPoint: string,
    username?: string,
    password?: string,
  ) {
    this.onNtripClientStateChange("re-connecting");
    this.createConnection(host, port, mountPoint, username, password);
    console.log("aaaaaaa");
  }

  public connect(
    host: string,
    port: number,
    mountPoint: string,
    username?: string,
    password?: string,
  ) {
    this.createConnection(host, port, mountPoint, username, password);
  }

  public read(callback: (data: Buffer) => void) {
    this.socket.on("data", async (data) => {
      this.onNtripClientStateChange(new Date());
      callback(data);
    });
  }

  public disconnect() {
    this.wantDisconnect = true;
    this.socket.destroy();
  }
}
