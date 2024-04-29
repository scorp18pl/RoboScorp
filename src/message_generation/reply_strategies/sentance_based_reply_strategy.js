const path = require('path');
const { ReplyStorage, dataPath } = require('../reply_storage');
const { ReplyTriggers } = require('../reply_triggers');
const { ReplyStrategy } = require('./reply_strategy');

class SentanceBasedReplyStrategy extends ReplyStrategy {
  static #replyTriggers = SentanceBasedReplyStrategy.#constructTriggers();
  static #threshhold = 0.7;

  constructor(scoreStrategy) {
    super();
    this.scoreStrategy = scoreStrategy;
  }

  selectReply(message) {
    let bestScore = 0;
    let bestReplyKey = '';
    for (const replyTrigger of SentanceBasedReplyStrategy.#replyTriggers) {
      const newScore = replyTrigger.calculateScore(
        message.content,
        this.scoreStrategy,
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
    const triggersFilePath = path.join(dataPath, '/triggers/triggers.json');
    const triggers = require(triggersFilePath);

    const triggerList = [];
    for (const key in triggers) {
      triggerList.push(new ReplyTriggers(key, triggers[key]));
    }

    return triggerList;
  }
}

module.exports = { SentanceBasedReplyStrategy };
