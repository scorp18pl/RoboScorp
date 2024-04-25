const { stringSimilarity } = require("string-similarity-js");

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

module.exports = {ScoreStrategy, SimilarityScoreStrategy, WordScoreStrategy};