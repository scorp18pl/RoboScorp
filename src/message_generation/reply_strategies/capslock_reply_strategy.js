const { ReplyStrategy } = require('./reply_strategy');

class CapsLockReplyStrategy extends ReplyStrategy {
  static #threshHold = 0.8;

  selectReply(message) {
    const string = message.content;
    let upper = 0;

    let i = string.length;
    while (--i) {
      const c = string.charAt(i);
      if (c.toUpperCase() === c && c.toLowerCase() !== c) {
        ++upper;
      }
    }

    if (upper / string.length > CapsLockReplyStrategy.#threshHold) {
      return ReplyStorage.getRandomReply('MeanScream');
    }
    return null;
  }
}

module.exports = { CapsLockReplyStrategy };
