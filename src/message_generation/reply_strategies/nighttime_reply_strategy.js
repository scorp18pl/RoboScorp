const { ReplyStrategy } = require('./reply_strategy');
const { ReplyStorage } = require('../reply_storage');

class NightTimeReplyStrategy extends ReplyStrategy {
  static #nightBegin = 24;
  static #nightEnd = 6;

  selectReply(message) {
    const hours = message.createdAt.getHours();
    const isNightTime = hours < NightTimeReplyStrategy.#nightEnd || hours > NightTimeReplyStrategy.#nightBegin;
    if (isNightTime) {
      return ReplyStorage.getRandomReply('MeanSleep');
    }
    return null;
  }
}

module.exports = { NightTimeReplyStrategy };
