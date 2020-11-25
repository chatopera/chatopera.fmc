// -*- coding: utf-8 -*-
//===============================================================================
//
// Copyright (c) 2020 Chatopera Inc. <https://www.chatopera.com> All Rights Reserved
//
//
// Author: Hai Liang Wang
// Date: 2020-11-25:18:36:48
//
//===============================================================================
const debug = require('debug')('fmt:services:chatopera');
const { Chatbot } = require('@chatopera/sdk');
const config = require('../config');
const _ = require('lodash');
const CONSTANTS = require('../miscs/constants');
const { getAccountByPageId } = require('../miscs/utils');

class ChatoperaService {
  constructor(clientId, secret) {
    this.chatbot = new Chatbot(clientId, secret, config.BOT_PROVIDER);
  }

  async conversationQuery(fromUserId, textMessage) {
    let { rc, error, data } = await this.chatbot.command(
      'POST',
      '/conversation/query',
      {
        fromUserId,
        textMessage,
        //   faqBestReplyThreshold: 0.6,
        //   faqSuggReplyThreshold: 0.35,
      }
    );

    if (rc != 0) {
      throw new Error(error);
    }

    return data;
  }
}

exports.getInstance = (pageId, locale) => {
  let account = getAccountByPageId(config.accounts, pageId);
  if (!account) {
    throw new Error('app %s account config not found.', pageId);
  }

  locale = locale || CONSTANTS.DV_LOCALE;
  let chatbotConfig = account.chatopera[locale];

  if (!chatbotConfig) {
    chatbotConfig = account.chatopera[CONSTANTS.DV_LOCALE];
  }

  if (!chatbotConfig) {
    throw new Error(`locale ${locale} bot not found.`);
  }

  debug('resolve bot instance settings', chatbotConfig);

  return new ChatoperaService(chatbotConfig.clientId, chatbotConfig.secret);
};
