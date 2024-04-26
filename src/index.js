require('dotenv').config();
const { RoboScorp } = require('./robo_scorp');

const roboScorp = new RoboScorp();
roboScorp.start();
