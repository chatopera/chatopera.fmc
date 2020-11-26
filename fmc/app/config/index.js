require('dotenv').config();
const debug = require('debug')('fmc:config');
const _ = require('lodash');
const accounts_module = process.env['FMC_ACCOUNTS']
  ? process.env['FMC_ACCOUNTS']
  : './accounts.json';
debug('resolve accounts module path %s', accounts_module);
const accounts = require(accounts_module);

const config = {
  MONGO_URI: process.env['MONGO_URI'] || 'mongodb://mongodb:27017/fmc',
  BOT_PROVIDER: process.env['BOT_PROVIDER'] || 'https://bot.chatopera.com',
  PORT: process.env['PORT'] || 8555,
  FAQ_BEST_REPLY_THRESHOLD: process.env['FAQ_BEST_REPLY_THRESHOLD']
    ? Number(process.env['FAQ_BEST_REPLY_THRESHOLD'])
    : 0.8,
  // give more info if possible
  FAQ_SUGG_REPLY_THRESHOLD: process.env['FAQ_SUGG_REPLY_THRESHOLD']
    ? Number(process.env['FAQ_SUGG_REPLY_THRESHOLD'])
    : 0.0001,
  accounts,
};

let all = _.assign(config, process.env);

module.exports = exports = all;
