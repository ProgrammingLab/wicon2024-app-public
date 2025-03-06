/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-is-mounted */
/* eslint no-bitwise: "off" */
import { Buffer } from "buffer";
import _Readable, { Transform } from "readable-stream";

import navFunctions, {
  ReturnPosllh,
  ReturnPvt,
  ReturnSat,
  ReturnStatus,
  ReturnVelned,
} from "./nav";
import { packetTypes, packetTypesInversed } from "./ubx";

export type ProtocolMessage = {
  messageClass: number;
  messageId: number;
  payload: Buffer;
};

export type parsedResult =
  | ReturnStatus
  | ReturnPosllh
  | ReturnVelned
  | ReturnSat
  | ReturnPvt;

export default class UBXPacketParser extends Transform {
  constructor(options?: _Readable.TransformOptions) {
    super({
      ...options,
      objectMode: true,
    });
  }

  _transform(
    chunk: ProtocolMessage,
    encoding: BufferEncoding,
    cb: (error?: Error | null, data?: any) => void,
  ) {
    const packetType =
      `${chunk.messageClass}_${chunk.messageId}` as keyof typeof packetTypesInversed;
    // const packetTypeString = packetTypesInversed[packetType];

    let result: parsedResult;
    switch (packetType) {
      case packetTypes["NAV-STATUS"]:
        result = navFunctions.status(chunk);
        break;
      case packetTypes["NAV-POSLLH"]:
        result = navFunctions.posllh(chunk);
        break;

      case packetTypes["NAV-VELNED"]:
        result = navFunctions.velned(chunk);
        break;

      case packetTypes["NAV-SAT"]:
        result = navFunctions.sat(chunk);
        break;

      case packetTypes["NAV-PVT"]:
        result = navFunctions.pvt(chunk);
        break;

      default:
        // console.log(
        //   `Unknown packet type: "${packetTypeString}" "${packetType}"`,
        // );
        cb();

        return;
    }

    this.push(result);

    cb();
  }
}
