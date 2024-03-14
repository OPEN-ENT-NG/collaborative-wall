export function createReport() {
  return {
    countSentMessages: 0,
    countSentMessagesByType: {},
    countReceivedMessages: 0,
    countReceivedMessagesByType: {},
    getCountReceivedMessages(type) {
      return this.countReceivedMessagesByType[type]
        ? this.countReceivedMessagesByType[type]
        : 0;
    },
    getCountSentMessages(type) {
      return this.countSentMessagesByType[type]
        ? this.countSentMessagesByType[type]
        : 0;
    },
    onSentMessage(payload) {
      this.countSentMessages++;
      if (!this.countSentMessagesByType[payload.type]) {
        this.countSentMessagesByType[payload.type] = 0;
      }
      this.countSentMessagesByType[payload.type]++;
    },
    onReceivedMessage(payload) {
      this.countReceivedMessages++;
      if (!this.countReceivedMessagesByType[payload.type]) {
        this.countReceivedMessagesByType[payload.type] = 0;
      }
      this.countReceivedMessagesByType[payload.type]++;
    },
  };
}
