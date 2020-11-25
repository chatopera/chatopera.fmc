require('dotenv').config();
const _ = require('lodash');
const accounts = require(process.env['FMT_ACCOUNTS']
  ? process.env['FMT_ACCOUNTS']
  : './accounts.json');

const config = {
  MONGO_URI: process.env['MONGO_URI'] || 'mongodb://mongo:27017/fmt',
  BOT_PROVIDER: process.env['BOT_PROVIDER'] || 'https://bot.chatopera.com',
  PORT: process.env['PORT'] || 8555,
  accounts,
};

let all = _.assign(config, process.env);

module.exports = exports = all;
