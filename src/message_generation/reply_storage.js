const path = require('path');

const dataPath = path.join(__dirname, '/../../RoboScorpData');

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
    const repliesFilePath = path.join(dataPath, '/replies/replies.json');
    return require(repliesFilePath);
  }
}

module.exports = { ReplyStorage, dataPath };
