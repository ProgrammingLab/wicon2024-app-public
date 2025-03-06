import { Buffer } from "buffer";

import rawData from "./rawReceiverData";

const dummyDataList = rawData.split(/(?=b562)/);

class DummyReceiver {
  intervalID: number | undefined;

  on(callback: (data: Buffer) => void) {
    let i = 0;
    this.intervalID = window.setInterval(() => {
      callback(Buffer.from(dummyDataList[i], "hex"));
      i++;
      if (i >= dummyDataList.length) {
        i = 0;
      }
    }, 100);
  }

  clear() {
    window.clearInterval(this.intervalID);
  }
}

export default DummyReceiver;
