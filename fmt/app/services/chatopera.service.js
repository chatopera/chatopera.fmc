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
const { Chatbot } = require('@chatopera/sdk');
const config = require('../config');
const _ = require('lodash');

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

exports.getInstance = (appId, locale) => {
  const defaultLocale = 'en_US';
  let account = _.find(config.accounts, { appId });
  if (!account) {
    throw new Error('app %s account config not found.', appId);
  }

  locale = locale || defaultLocale;
  let chatbotConfig = account.chatbot[locale];

  if (!chatbotConfig) {
    chatbotConfig = account.chatbot[defaultLocale];
  }

  if (!chatbotConfig) {
    throw new Error(`locale ${locale} bot not found.`);
  }

  console.log(chatbotConfig);

  return new ChatoperaService(chatbotConfig.clientId, chatbotConfig.secret);
};
