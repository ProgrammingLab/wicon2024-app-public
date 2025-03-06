/* eslint-disable no-bitwise,default-case */
import { ProtocolMessage } from ".";
import { gnssIdentifiersInversed } from "./ubx";

function bitToBool(byte: number, bit: number) {
  return (byte >> bit) % 2 !== 0;
}

function iTowToDate(itow: number) {
  const gpsEpochSeconds = 315964800;
  const weekSeconds = 60 * 60 * 24 * 7;
  const week = Math.floor(
    (new Date().getTime() - new Date("1980-01-06").getTime()) /
      1000 /
      60 /
      60 /
      24 /
      7,
  );

  return new Date((gpsEpochSeconds + weekSeconds * week + itow / 1000) * 1000);
}

function status(packet: ProtocolMessage): ReturnStatus {
  const gpsFix = {
    raw: packet.payload.readUInt8(4),
    string: "",
  };

  switch (gpsFix.raw) {
    case 0x00:
      gpsFix.string = "no fix";
      break;
    case 0x01:
      gpsFix.string = "dead reckoning only";
      break;
    case 0x02:
      gpsFix.string = "2D-fix";
      break;
    case 0x03:
      gpsFix.string = "3D-fix";
      break;
    case 0x05:
      gpsFix.string = "GPS + dead reckoning combined";
      break;
    case 0x06:
      gpsFix.string = "Time only fix";
      break;
  }

  const flags = {
    gpsFixOk: bitToBool(packet.payload.readUInt8(5), 0),
    diffSoln: bitToBool(packet.payload.readUInt8(5), 1),
    wknSet: bitToBool(packet.payload.readUInt8(5), 2),
    towSet: bitToBool(packet.payload.readUInt8(5), 3),
  };

  const flags2 = {
    psmState: {
      raw: 0,
      string: "",
    },
    spoofDetState: {
      raw: 0,
      string: "",
    },
  };

  switch (
    `${(packet.payload.readUInt8(7) >> 1) % 2}${(packet.payload.readUInt8(7) >> 0) % 2}`
  ) {
    case "00":
      flags2.psmState.raw = 0;
      flags2.psmState.string = "ACQUISITION";
      break;
    case "01":
      flags2.psmState.raw = 1;
      flags2.psmState.string = "TRACKING";
      break;
    case "10":
      flags2.psmState.raw = 2;
      flags2.psmState.string = "POWER OPTIMIZED TRACKING";
      break;
    case "11":
      flags2.psmState.raw = 3;
      flags2.psmState.string = "INACTIVE";
      break;
  }

  switch (
    `${(packet.payload.readUInt8(7) >> 4) % 2}${(packet.payload.readUInt8(7) >> 3) % 2}`
  ) {
    case "00":
      flags2.spoofDetState.raw = 0;
      flags2.spoofDetState.string = "Unknown or deactivated";
      break;
    case "01":
      flags2.spoofDetState.raw = 1;
      flags2.spoofDetState.string = "No spoofing indicated";
      break;
    case "10":
      flags2.spoofDetState.raw = 2;
      flags2.spoofDetState.string = "Spoofing indicated";
      break;
    case "11":
      flags2.spoofDetState.raw = 3;
      flags2.spoofDetState.string = "Multiple spoofing indications";
      break;
  }

  const fixStat = {
    diffCorr: bitToBool(packet.payload.readUInt8(6), 0),
    mapMatching: `${(packet.payload.readUInt8(6) >> 7) % 2}${(packet.payload.readUInt8(6) >> 6) % 2}`,
  };

  return {
    type: "NAV-STATUS",
    iTOW: packet.payload.readUInt32LE(0),
    timeStamp: iTowToDate(packet.payload.readUInt32LE(0)),
    data: {
      iTOW: packet.payload.readUInt32LE(0),
      gpsFix,
      flags,
      fixStat,
      flags2,
      ttff: packet.payload.readUInt32LE(8),
      msss: packet.payload.readUInt32LE(12),
    },
  };
}

export type ReturnStatus = {
  type: "NAV-STATUS";
  iTOW: number;
  timeStamp: Date;
  data: {
    iTOW: number;
    gpsFix: {
      raw: number;
      string: string;
    };
    flags: {
      gpsFixOk: boolean;
      diffSoln: boolean;
      wknSet: boolean;
      towSet: boolean;
    };
    flags2: {
      psmState: {
        raw: number;
        string: string;
      };
      spoofDetState: {
        raw: number;
        string: string;
      };
    };
    fixStat: {
      diffCorr: boolean;
      mapMatching: string;
    };
    ttff: number;
    msss: number;
  };
};

function posllh(packet: ProtocolMessage): ReturnPosllh {
  return {
    type: "NAV-POSLLH",
    iTOW: packet.payload.readUInt32LE(0),
    timeStamp: iTowToDate(packet.payload.readUInt32LE(0)),
    data: {
      iTOW: packet.payload.readUInt32LE(0),
      lon: packet.payload.readInt32LE(4) * 1e-7,
      lat: packet.payload.readInt32LE(8) * 1e-7,
      height: packet.payload.readInt32LE(12),
      hMSL: packet.payload.readInt32LE(16),
      hAcc: packet.payload.readUInt32LE(20),
      vAcc: packet.payload.readUInt32LE(24),
    },
  };
}

export type ReturnPosllh = {
  type: "NAV-POSLLH";
  iTOW: number;
  timeStamp: Date;
  data: {
    iTOW: number;
    lon: number;
    lat: number;
    height: number;
    hMSL: number;
    hAcc: number;
    vAcc: number;
  };
};

function velned(packet: ProtocolMessage): ReturnVelned {
  return {
    type: "NAV-VELNED",
    iTOW: packet.payload.readUInt32LE(0),
    timeStamp: iTowToDate(packet.payload.readUInt32LE(0)),
    data: {
      iTOW: packet.payload.readUInt32LE(0),
      velN: packet.payload.readInt32LE(4),
      velE: packet.payload.readInt32LE(8),
      velD: packet.payload.readInt32LE(12),
      speed: packet.payload.readUInt32LE(16),
      gSpeed: packet.payload.readUInt32LE(20),
      heading: packet.payload.readInt32LE(24) * 1e-5,
      sAcc: packet.payload.readUInt32LE(28),
      cAcc: packet.payload.readInt32LE(32) * 1e-5,
    },
  };
}

export type ReturnVelned = {
  type: "NAV-VELNED";
  iTOW: number;
  timeStamp: Date;
  data: {
    iTOW: number;
    velN: number;
    velE: number;
    velD: number;
    speed: number;
    gSpeed: number;
    heading: number;
    sAcc: number;
    cAcc: number;
  };
};

function sat(packet: ProtocolMessage): ReturnSat {
  const satCount = packet.payload.readUInt8(5);
  const sats = [];

  for (let i = 0; i < satCount; i += 1) {
    const flags = {
      qualityInd: {
        raw: 0,
        string: `${(packet.payload.readUInt8(16 + 12 * i) >> 2) % 2}${(packet.payload.readUInt8(16 + 12 * i) >> 1) % 2}${(packet.payload.readUInt8(16 + 12 * i) >> 0) % 2}`,
      },
      svUsed: bitToBool(packet.payload.readUInt8(16 + 12 * i), 3),
      health: {
        raw: 0,
        string: `${(packet.payload.readUInt8(16 + 12 * i) >> 5) % 2}${(packet.payload.readUInt8(16 + 12 * i) >> 4) % 2}`,
      },
      diffCorr: bitToBool(packet.payload.readUInt8(16 + 12 * i), 6),
      smoothed: bitToBool(packet.payload.readUInt8(16 + 12 * i), 7),
      orbitSource: {
        raw: 0,
        string: `${(packet.payload.readUInt8(17 + 12 * i) >> 2) % 2}${(packet.payload.readUInt8(17 + 12 * i) >> 1) % 2}${(packet.payload.readUInt8(17 + 12 * i) >> 0) % 2}`,
      },
      ephAvail: bitToBool(packet.payload.readUInt8(17 + 12 * i), 3),
      almAvail: bitToBool(packet.payload.readUInt8(17 + 12 * i), 4),
      anoAvail: bitToBool(packet.payload.readUInt8(17 + 12 * i), 5),
      aopAvail: bitToBool(packet.payload.readUInt8(17 + 12 * i), 6),
      sbasCorrUsed: bitToBool(packet.payload.readUInt8(18 + 12 * i), 0),
      rtcmCorrUsed: bitToBool(packet.payload.readUInt8(18 + 12 * i), 1),
      prCorrUsed: bitToBool(packet.payload.readUInt8(18 + 12 * i), 4),
      crCorrUsed: bitToBool(packet.payload.readUInt8(18 + 12 * i), 5),
      doCorrUsed: bitToBool(packet.payload.readUInt8(18 + 12 * i), 6),
    };

    switch (flags.qualityInd.string) {
      case "000":
        flags.qualityInd.raw = 0;
        flags.qualityInd.string = "no signal";
        break;
      case "001":
        flags.qualityInd.raw = 1;
        flags.qualityInd.string = "searching signal";
        break;
      case "010":
        flags.qualityInd.raw = 2;
        flags.qualityInd.string = "signal acquired";
        break;
      case "011":
        flags.qualityInd.raw = 3;
        flags.qualityInd.string = "signal detected but unusable";
        break;
      case "100":
        flags.qualityInd.raw = 4;
        flags.qualityInd.string = "code locked and time synchronized";
        break;
      case "101":
        flags.qualityInd.raw = 5;
        flags.qualityInd.string =
          "code and carrier locked and time synchronized";
        break;
      case "110":
        flags.qualityInd.raw = 6;
        flags.qualityInd.string =
          "code and carrier locked and time synchronized";
        break;
      case "111":
        flags.qualityInd.raw = 7;
        flags.qualityInd.string =
          "code and carrier locked and time synchronized";
        break;
    }

    switch (flags.health.string) {
      case "00":
        flags.health.raw = 0;
        flags.health.string = "unknown";
        break;
      case "01":
        flags.health.raw = 1;
        flags.health.string = "healthy";
        break;
      case "10":
        flags.health.raw = 2;
        flags.health.string = "unhealthy";
        break;
    }

    switch (flags.orbitSource.string) {
      case "000":
        flags.orbitSource.raw = 0;
        flags.orbitSource.string =
          "no orbit information is available for this SV";
        break;
      case "001":
        flags.orbitSource.raw = 1;
        flags.orbitSource.string = "ephemeris is used";
        break;
      case "010":
        flags.orbitSource.raw = 2;
        flags.orbitSource.string = "almanac is used";
        break;
      case "011":
        flags.orbitSource.raw = 3;
        flags.orbitSource.string = "AssistNow Offline orbit is used";
        break;
      case "100":
        flags.orbitSource.raw = 4;
        flags.orbitSource.string = "AssistNow Autonomous orbit is used";
        break;
      case "101":
        flags.orbitSource.raw = 5;
        flags.orbitSource.string = "other orbit information is used";
        break;
      case "110":
        flags.orbitSource.raw = 6;
        flags.orbitSource.string = "other orbit information is used";
        break;
      case "111":
        flags.orbitSource.raw = 7;
        flags.orbitSource.string = "other orbit information is used";
        break;
    }

    sats.push({
      gnss: {
        raw: packet.payload.readUInt8(8 + 12 * i),
        string:
          gnssIdentifiersInversed[
            packet.payload.readUInt8(
              8 + 12 * i,
            ) as keyof typeof gnssIdentifiersInversed
          ],
      },
      svId: packet.payload.readUInt8(9 + 12 * i),
      cno: packet.payload.readUInt8(10 + 12 * i),
      elev: packet.payload.readInt8(11 + 12 * i),
      azim: packet.payload.readInt16LE(12 + 12 * i),
      prRes: packet.payload.readInt16LE(14 + 12 * i) * 0.1,
      flags,
    });
  }

  return {
    type: "NAV-SAT",
    iTOW: packet.payload.readUInt32LE(0),
    timeStamp: iTowToDate(packet.payload.readUInt32LE(0)),
    data: {
      iTOW: packet.payload.readUInt32LE(0),
      version: packet.payload.readUInt8(4),
      numSvs: packet.payload.readUInt8(5),
      sats,
    },
  };
}

export type ReturnSat = {
  type: "NAV-SAT";
  iTOW: number;
  timeStamp: Date;
  data: {
    iTOW: number;
    version: number;
    numSvs: number;
    sats: {
      gnss: {
        raw: number;
        string: string;
      };
      svId: number;
      cno: number;
      elev: number;
      azim: number;
      prRes: number;
      flags: {
        qualityInd: {
          raw: number;
          string: string;
        };
        svUsed: boolean;
        health: {
          raw: number;
          string: string;
        };
        diffCorr: boolean;
        smoothed: boolean;
        orbitSource: {
          raw: number;
          string: string;
        };
        ephAvail: boolean;
        almAvail: boolean;
        anoAvail: boolean;
        aopAvail: boolean;
        sbasCorrUsed: boolean;
        rtcmCorrUsed: boolean;
        prCorrUsed: boolean;
        crCorrUsed: boolean;
        doCorrUsed: boolean;
      };
    }[];
  };
};

function pvt(packet: ProtocolMessage): ReturnPvt {
  const gpsFix = {
    raw: packet.payload.readUInt8(20),
    string: "",
  };

  switch (gpsFix.raw) {
    case 0x00:
      gpsFix.string = "no fix";
      break;
    case 0x01:
      gpsFix.string = "dead reckoning only";
      break;
    case 0x02:
      gpsFix.string = "2D-fix";
      break;
    case 0x03:
      gpsFix.string = "3D-fix";
      break;
    case 0x05:
      gpsFix.string = "GPS + dead reckoning combined";
      break;
    case 0x06:
      gpsFix.string = "Time only fix";
      break;
  }

  const flags = {
    gnssFixOk: bitToBool(packet.payload.readUInt8(21), 0),
    diffSoln: bitToBool(packet.payload.readUInt8(21), 1),
    psmState: {
      raw: 0,
      string: `${(packet.payload.readUInt8(21) >> 4) % 2}${(packet.payload.readUInt8(21) >> 3) % 2}${(packet.payload.readUInt8(21) >> 2) % 2}`,
    },
    headVehValid: bitToBool(packet.payload.readUInt8(21), 5),
    carrSoln: {
      raw: 0,
      string: `${(packet.payload.readUInt8(21) >> 7) % 2}${(packet.payload.readUInt8(21) >> 6) % 2}`,
    },
  };

  const valid = {
    validDate: bitToBool(packet.payload.readUInt8(11), 0),
    validTime: bitToBool(packet.payload.readUInt8(11), 1),
    fullyResolved: bitToBool(packet.payload.readUInt8(11), 2),
    validMag: bitToBool(packet.payload.readUInt8(11), 3),
  };

  const flags2 = {
    confirmedAvai: bitToBool(packet.payload.readUInt8(22), 5),
    confirmedDate: bitToBool(packet.payload.readUInt8(22), 6),
    confirmedTime: bitToBool(packet.payload.readUInt8(22), 7),
  };

  return {
    type: "NAV-PVT",
    iTOW: packet.payload.readUInt32LE(0),
    timeStamp: iTowToDate(packet.payload.readUInt32LE(0)),
    data: {
      iTOW: packet.payload.readUInt32LE(0),
      year: packet.payload.readUInt16LE(4),
      month: packet.payload.readUInt8(6),
      day: packet.payload.readUInt8(7),
      hour: packet.payload.readUInt8(8),
      minute: packet.payload.readUInt8(9),
      second: packet.payload.readUInt8(10),
      valid,
      tAcc: packet.payload.readUInt32LE(12),
      nano: packet.payload.readInt32LE(16),
      fixType: gpsFix,
      flags,
      flags2,
      numSV: packet.payload.readUInt8(23),
      lon: packet.payload.readInt32LE(24) * 1e-7,
      lat: packet.payload.readInt32LE(28) * 1e-7,
      height: packet.payload.readInt32LE(32),
      hMSL: packet.payload.readInt32LE(36),
      hAcc: packet.payload.readUInt32LE(40),
      vAcc: packet.payload.readUInt32LE(44),
      velN: packet.payload.readInt32LE(48),
      velE: packet.payload.readInt32LE(52),
      velD: packet.payload.readInt32LE(56),
      gSpeed: packet.payload.readInt32LE(60),
      headMot: packet.payload.readInt32LE(64) * 1e-5,
      sAcc: packet.payload.readUInt32LE(68),
      headAcc: packet.payload.readUInt32LE(72) * 1e-5,
    },
  };
}

export type ReturnPvt = {
  type: "NAV-PVT";
  iTOW: number;
  timeStamp: Date;
  data: {
    iTOW: number;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    valid: {
      validDate: boolean;
      validTime: boolean;
      fullyResolved: boolean;
      validMag: boolean;
    };
    tAcc: number;
    nano: number;
    fixType: {
      raw: number;
      string: string;
    };
    flags: {
      gnssFixOk: boolean;
      diffSoln: boolean;
      psmState: {
        raw: number;
        string: string;
      };
      headVehValid: boolean;
      carrSoln: {
        raw: number;
        string: string;
      };
    };
    flags2: {
      confirmedAvai: boolean;
      confirmedDate: boolean;
      confirmedTime: boolean;
    };
    numSV: number;
    lon: number;
    lat: number;
    height: number;
    hMSL: number;
    hAcc: number;
    vAcc: number;
    velN: number;
    velE: number;
    velD: number;
    gSpeed: number;
    headMot: number;
    sAcc: number;
    headAcc: number;
  };
};

export default {
  status,
  posllh,
  velned,
  sat,
  pvt,
};
