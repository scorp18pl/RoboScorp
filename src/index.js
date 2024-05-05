require('dotenv').config();
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { RoboScorp } = require('./robo_scorp');
const logger = require('./logger');

const argv = yargs(hideBin(process.argv))
  .option('d', {
    alias: 'debug',
    boolean: true,
    default: false,
    describe: 'Run in debug mode',
  })
  .parse();

logger.setIsDebug(argv.debug);

const roboScorp = new RoboScorp();
roboScorp.start();
