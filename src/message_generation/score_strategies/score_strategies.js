const { stringSimilarity } = require('string-similarity-js');

const { ScoreStrategy } = require('./score_strategy');

class WordScoreStrategy extends ScoreStrategy {
  getScore(trigger, string) {
    let max = 0.0;
    const words = string.split(' ');
    words.array.forEach((word) => {
      const current = stringSimilarity(trigger, word);
      max = current > max ? current : max;
    });

    return max;
  }
}

module.exports = { WordScoreStrategy };
