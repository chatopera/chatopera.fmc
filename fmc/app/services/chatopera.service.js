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
const debug = require('debug')('fmc:services:chatopera');
const { Chatbot } = require('@chatopera/sdk');
const config = require('../config');

class ChatoperaService {
  constructor(clientId, secret) {
    this.chatbot = new Chatbot(clientId, secret, config.BOT_PROVIDER);
  }

  async conversationQuery(
    fromUserId,
    textMessage,
    faqBestReplyThreshold = 0.8,
    faqSuggReplyThreshold = 0.3
  ) {
    let { rc, error, data } = await this.chatbot.command(
      'POST',
      '/conversation/query',
      {
        fromUserId,
        textMessage,
        faqBestReplyThreshold,
        faqSuggReplyThreshold,
      }
    );

    if (rc != 0) {
      throw new Error(error);
    }
    debug('[conversationQuery] result', JSON.stringify(data, null, ' '));

    return data;
  }
}

exports.getInstance = (pageId, locale, account) => {
  if (!account) {
    throw new Error('app %s account config not found.', pageId);
  }

  let chatbotConfig = account.chatopera[locale];

  if (!chatbotConfig) {
    throw new Error(`locale ${locale} bot not found.`);
  }

  //   debug(
  //     'resolve bot instance settings',
  //     JSON.stringify(chatbotConfig, null, ' ')
  //   );

  return new ChatoperaService(chatbotConfig.clientId, chatbotConfig.secret);
};
