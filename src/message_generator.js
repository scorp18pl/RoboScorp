const { stringSimilarity } = require("string-similarity-js");
const path = require("path");

const DataPath = "../RoboScorpData";

class ReplyTriggers {
  constructor(replyKey, triggerMessageList, isExact = false) {
    this.key = replyKey;
    this.triggers = triggerMessageList;
    this.isExact = isExact;
  }

  calculateScore(string, scoreStrategy) {
    let best = 0;
    for (const trigger of this.triggers) {
      const current = scoreStrategy.getScore(trigger, string);
      best = current > best ? current : best;
    }

    return best;
  }
}

class ReplyStorage {
  static #replies = ReplyStorage.#constructReplies();

  static getReplySet(key) {
    let set = ReplyStorage.#replies[key];
    if (set === undefined) {
      set = null;
    }

    return set;
  }

  static getRandomReply(key) {
    const replies = this.getReplySet(key);
    if (!replies) {
      console.assert(false, `The key "${key}" is not present in the storage.`);
      return null;
    }

    const index = Math.floor(Math.random() * replies.length);
    return replies[index];
  }

  static #constructReplies() {
    const repliesFilePath =  path.join(__dirname, `${DataPath}/replies/replies.json`);
    return require(repliesFilePath);
  }
}

class ScoreStrategy {
  getScore(trigger, string) {
    return 0;
  }
}

class SimilarityScoreStrategy extends ScoreStrategy {
  getScore(trigger, string) {
    return stringSimilarity(trigger, string);
  }
}

class WordScoreStrategy extends ScoreStrategy {
  getScore(trigger, string) {
    let max = 0.0;
    const words = string.split(' ')
    for (const word of words) {
      const current = stringSimilarity(trigger, word);
      max = current > max ? current : max; 
    }

    return max;
  }
}

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

class MessageGenerator {
  static #replyStrategies = [
    [new NightTimeReplyStrategy(), 0.5],
    [new CapsLockReplyStrategy(), 1.0],
    [new SentanceBasedReplyStrategy(new SimilarityScoreStrategy()), 2.0],
    [new SentanceBasedReplyStrategy(new WordScoreStrategy()), 1.0],
  ];

  static selectReply(message) {
    const candidates = [];
    for (const [strategy, weight] of MessageGenerator.#replyStrategies) {
      const reply = strategy.selectReply(message);
      if (reply) {
        candidates.push([reply, weight]);
      }
    }

    if (candidates.length !== 0) {
      return this.#selectCandidate(candidates);
    }
    return null;
  }

  static #selectCandidate(candidates) {
    let weightSum = 0.0;
    for (const [, weight] of candidates) {
      weightSum += weight;
    }

    let target = Math.random() * weightSum;
    for (const [candidate, weight] of candidates) {
      if (target < weight) {
        return candidate;
      }

      target -= weight;
    }

    console.assert(false, "The loop was executed badly. Programmer error.");
    return null;
  }
}

module.exports = { MessageGenerator };
