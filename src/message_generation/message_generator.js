const logger = require('../logger');
const { NightTimeReplyStrategy, CapsLockReplyStrategy, SentanceBasedReplyStrategy } = require('./reply_strategies/reply_strategies');

const { SimilarityScoreStrategy, WordScoreStrategy } = require('./score_strategies/score_strategies');

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

    logger.crit('The loop was executed badly. Programmer error.', 'MessageGenerator');
    return null;
  }
}

module.exports = { MessageGenerator };
