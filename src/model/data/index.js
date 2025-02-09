// src/model/data/index.js

//Memory strategy

const logger = require('../../logger');

if (!process.env.MEMORY_STRATEGY) {
  logger.error('Strategy is not defined');
  throw new Error('Strategy is not defined');
}

if (process.env.MEMORY_STRATEGY === 'dev') {
  logger.info('Invoking development memory strategy with in-built memory-db');
  module.exports = require('./memory');
}
