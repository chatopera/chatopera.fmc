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
  accounts,
};

let all = _.assign(config, process.env);

module.exports = exports = all;
