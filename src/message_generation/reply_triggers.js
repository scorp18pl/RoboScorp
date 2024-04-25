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

export default { ReplyTriggers };