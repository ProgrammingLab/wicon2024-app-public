declare module "*.jpg";
declare module "*.jpeg";
declare module "*.png";
declare module "*.mp3";
declare module "net" {
  import TcpSockets from "react-native-tcp-socket";
  export = TcpSockets;
}
