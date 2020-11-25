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
const got = require('got');
const _ = require('lodash');
const config = require('../config');
const debug = require('debug')('fmt:service:facebook');
const {
  getAccountByPageId,
  getAccessTokenByPageId,
} = require('../miscs/utils');

const FACEBOOK_MESSAGES_API = 'https://graph.facebook.com/v2.6/me/messages';

class FacebookService {
  constructor(pageId, access_token) {
    this.pageId = pageId;
    this.access_token = access_token;
  }

  async sendTextMessage(recipientId, msg) {
    debug('sendTextMessage (%s, %s)', recipientId, msg);
    let body = await got
      .post(FACEBOOK_MESSAGES_API, {
        searchParams: {
          access_token: this.access_token,
        },
        json: {
          recipient: {
            id: recipientId,
          },
          message: {
            text: msg,
            metadata: 'DEVELOPER_DEFINED_METADATA',
          },
        },
      })
      .json();
    debug('sendTextMessage res %s', JSON.stringify(body, null, 2));
  }

  async sendQuickReply(recipientId, replyMessage) {
    let body = await got
      .post(FACEBOOK_MESSAGES_API, {
        searchParams: {
          access_token: this.access_token,
        },
        json: {
          recipient: {
            id: recipientId,
          },
          message: replyMessage,
        },
      })
      .json();
    debug('sendQuickReply res %s', JSON.stringify(body, null, 2));
  }

  async sendButtonMessage(recipientId, msg, buttons) {
    debug('sendButtonMessage (%s, %s)', recipientId, msg);
    let body = await got
      .post(FACEBOOK_MESSAGES_API, {
        searchParams: {
          access_token: this.access_token,
        },
        json: {
          recipient: {
            id: recipientId,
          },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'button',
                text: msg,
                buttons,
              },
            },
          },
        },
      })
      .json();
    debug('sendButtonMessage res %s', JSON.stringify(body, null, 2));
    return body;
  }

  async sendImageMessage(recipientId, imageUrl) {
    debug('sendImageMessage (%s, %s)', recipientId, imageUrl);
    let body = await got
      .post(FACEBOOK_MESSAGES_API, {
        searchParams: {
          access_token: this.access_token,
        },
        json: {
          recipient: {
            id: recipientId,
          },
          message: {
            attachment: {
              type: 'image',
              payload: {
                url: imageUrl,
              },
            },
          },
        },
      })
      .json();
    debug('sendImageMessage res %s', JSON.stringify(body, null, 2));
  }

  // 发送一次性通知请求
  async sendOnetimeNotReq(recipientId, replyMessage, ref) {
    let { body } = await got.post(FACEBOOK_MESSAGES_API, {
      searchParams: {
        access_token: this.access_token,
      },
      json: {
        recipient: {
          id: recipientId,
        },
        message: {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'one_time_notif_req',
              title: replyMessage,
              payload: ref,
            },
          },
        },
      },
    });
  }

  // 发送一次性通知
  async sendOnetimeNot(token, msg) {
    let { body } = await got.post(FACEBOOK_MESSAGES_API, {
      searchParams: {
        access_token: this.access_token,
      },
      json: {
        recipient: {
          one_time_notif_token: token,
        },
        message: {
          text: msg /*通知内容*/,
        },
      },
    });
  }

  async getPersonProfile(psid) {
    let body = await got
      .get(`https://graph.facebook.com/${psid}`, {
        searchParams: {
          fields: 'locale,first_name,last_name,profile_pic',
          access_token: this.access_token,
        },
      })
      .json();

    debug('getPersonProfile res %s', JSON.stringify(body, null, 2));

    if (body.error) {
      debug('facebook api error %s', JSON.stringify(body.error, null, 2));
    }

    return body;
  }
}

const facebookInstance = {};
const facebookFactory = (pageId) => {
  let instance = facebookInstance[pageId];
  if (!instance) {
    let account = getAccountByPageId(config.accounts, pageId);
    let access_token = getAccessTokenByPageId(account, pageId);
    if (account) {
      instance = new FacebookService(pageId, access_token);
    } else {
      throw new Error('app %s account config not found.', pageId);
    }

    facebookInstance[pageId] = instance;
  }

  return instance;
};

exports.getInstance = facebookFactory;
