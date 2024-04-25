const path = require("path");
const { ReplyStorage, DataPath } = require("./reply_storage");
const ReplyTriggers = require("./reply_triggers");

class ReplyStrategy {
  selectReply(message) {
    return null;
  }
}

class CapsLockReplyStrategy extends ReplyStrategy {
  static #threshHold = 0.8;

  selectReply(message) {
    const string = message.content;
    let upper = 0;

    let i = string.length;
    while (--i) {
      const c = string.charAt(i);
      if ((c.toUpperCase() === c) && (c.toLowerCase() !== c)) {
        ++upper;
      }
    }

    if (upper / string.length > CapsLockReplyStrategy.#threshHold) {
      return ReplyStorage.getRandomReply("MeanScream");
    }
    return null;
  }
}

class NightTimeReplyStrategy extends ReplyStrategy {
  static #nightBegin = 24;
  static #nightEnd = 6;

  selectReply(message) {
    const hours = message.createdAt.getHours();
    const isNightTime =
      hours < NightTimeReplyStrategy.#nightEnd ||
      hours > NightTimeReplyStrategy.#nightBegin;
    if (isNightTime) {
      return ReplyStorage.getRandomReply("MeanSleep");
    }
    return null;
  }
}

class SentanceBasedReplyStrategy extends ReplyStrategy {
  static #replyTriggers = SentanceBasedReplyStrategy.#constructTriggers();
  static #threshhold = 0.7;

  constructor(scoreStrategy) {
    super();
    this.scoreStrategy = scoreStrategy;
  }

  selectReply(message) {
    let bestScore = 0;
    let bestReplyKey = "";
    for (const replyTrigger of SentanceBasedReplyStrategy.#replyTriggers) {
      const newScore = replyTrigger.calculateScore(
        message.content,
        this.scoreStrategy
      );
      if (newScore > bestScore) {
        bestScore = newScore;
        bestReplyKey = replyTrigger.key;
      }
    }

    if (bestScore >= SentanceBasedReplyStrategy.#threshhold) {
      return ReplyStorage.getRandomReply(bestReplyKey);
    }

    return null;
  }

  static #constructTriggers() {
    const triggersFilePath = path.join(__dirname, `${DataPath}/triggers/triggers.json`);
    const triggers = require(triggersFilePath);

    const triggerList = [];
    for (const key in triggers) {
      triggerList.push(new ReplyTriggers(key, triggers[key]));
    }

    return triggerList;
  }
}

module.exports(ReplyStrategy, CapsLockReplyStrategy, NightTimeReplyStrategy, SentanceBasedReplyStrategy);