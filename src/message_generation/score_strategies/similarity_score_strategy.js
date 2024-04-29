const { stringSimilarity } = require('string-similarity-js');

const { ScoreStrategy } = require('./score_strategy');

class SimilarityScoreStrategy extends ScoreStrategy {
  getScore(trigger, string) {
    return stringSimilarity(trigger, string);
  }
}

module.exports = { SimilarityScoreStrategy };
