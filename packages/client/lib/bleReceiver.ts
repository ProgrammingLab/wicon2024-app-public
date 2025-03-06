import { Buffer } from "buffer";
import * as ExpoDevice from "expo-device";
import { PermissionsAndroid, Platform } from "react-native";
import base64 from "react-native-base64";
import { BleManager, Device } from "react-native-ble-plx";

import UBXPacketParser, { parsedResult } from "./ubx-parser/ubx-packet-parser";
import { ReturnPvt } from "./ubx-parser/ubx-packet-parser/nav";
import UBXProtocolParser from "./ubx-parser/ubx-protocol-parser";

export type DeviceState =
  | "connecting"
  | "connected"
  | "re-connecting"
  | "disconnected"
  | "error";

export class BleReceiver {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private wantDisconnect: boolean = false;

  constructor() {
    console.debug("BleReceiver constructor was called");
    this.manager = new BleManager();
  }

  private async requestAndroid31Permissions() {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      },
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      },
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      },
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  }

  public async requestPermissions() {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await this.requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  }

  public async startScan(onDeviceFound: (device: Device[]) => void) {
    const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
      devices.findIndex((device) => nextDevice.id === device.id) > -1;

    const devices: Device[] = [];

    this.manager.onStateChange((state) => {
      console.debug("state", state);
      if (state === "PoweredOn") {
        this.manager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            console.error(error);
          }
          if (device) {
            if (!isDuplicteDevice(devices, device)) {
              devices.push(device);
              onDeviceFound([...devices, device]);
            }
          }
        });
      }
    }, true);
  }

  public stopScan = () => this.manager.stopDeviceScan();

  public async connect(
    device: Device,
    onDeviceStateChange: (state: DeviceState) => void,
  ) {
    try {
      this.wantDisconnect = false;
      onDeviceStateChange("connecting");
      this.connectedDevice = await device.connect();
      console.log("mtu: ", this.connectedDevice.mtu);
      // request mtu
      await this.connectedDevice.requestMTU(187);
      console.log("mtu: ", this.connectedDevice.mtu);
      onDeviceStateChange("connected");
      await this.connectedDevice.discoverAllServicesAndCharacteristics();
      this.connectedDevice.onDisconnected(async () => {
        onDeviceStateChange("disconnected");
        if (!this.wantDisconnect) {
          onDeviceStateChange("re-connecting");
          console.log("reconnecting...");
          device
            .connect()
            .then(async (connectedDevice) => {
              onDeviceStateChange("connected");
              console.log("re-connected");
              await connectedDevice.discoverAllServicesAndCharacteristics();
            })
            .catch((error) => {
              onDeviceStateChange("error");
              console.error("re-connect error", error);
            });
        }
      });
    } catch (error) {
      if (!this.wantDisconnect) {
        onDeviceStateChange("error");
        console.error("error", error);
      }

      return false;
    }
  }

  public read(callback: (data: ReturnPvt) => void): void {
    if (!this.connectedDevice) return;
    this.connectedDevice.monitorCharacteristicForService(
      "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
      "6E400003-B5A3-F393-E0A9-E50E24DCCA9E",
      (error, characteristic) => {
        if (error) {
          console.error("error1", error);
          return;
        }
        if (characteristic) {
          const protocolParser = new UBXProtocolParser();

          if (characteristic.value) {
            console.debug(
              "characteristic.value",
              Buffer.from(base64.decode(characteristic.value), "ascii"),
            );
            protocolParser.write(
              Buffer.from(base64.decode(characteristic.value), "ascii"),
            );
          }
          const packetParser = new UBXPacketParser();
          protocolParser.pipe(packetParser);
          packetParser.on("data", (data: parsedResult) => {
            if (data.type === "NAV-PVT") {
              callback(data);
            }
          });
        }
      },
    );
  }

  public async disconnect(device: Device) {
    this.wantDisconnect = true;
    if (await device.isConnected()) {
      await device.cancelConnection();
    }
  }

  public async write(data: Buffer) {
    if (!this.connectedDevice) return;
    await this.connectedDevice.writeCharacteristicWithResponseForService(
      "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
      "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
      data.toString("base64"),
    );
  }
}
