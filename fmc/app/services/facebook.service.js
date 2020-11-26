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
const debug = require('debug')('fmc:service:facebook');
const config = require('../config/index');
const { getAccessTokenByPageId } = require('../miscs/utils');
const { DV_GET_START_TEXT, DV_GREETING_TEXT } = require('../miscs/constants');

const FACEBOOK_MESSAGES_API = 'https://graph.facebook.com/v2.6/me/messages';
const FACEBOOK_MESSENGER_PROFILE_API =
  'https://graph.facebook.com/v2.6/me/messenger_profile';

class FacebookService {
  constructor(pageId, access_token) {
    this.pageId = pageId;
    this.access_token = access_token;
  }

  /**
   * Send text message by recipientId
   * https://developers.facebook.com/docs/messenger-platform/send-messages#messaging_types
   * @param {*} recipientId
   * @param {*} msg
   */
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

  /**
   * Send quick reply
   * https://developers.facebook.com/docs/messenger-platform/send-messages#messaging_types
   * @param {*} recipientId
   * @param {*} replyMessage
   */
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

  /**
   * Send button messages
   * https://developers.facebook.com/docs/messenger-platform/send-messages#messaging_types
   * @param {*} recipientId
   * @param {*} msg
   * @param {*} buttons
   */
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

  /**
   * Send a image via url
   * https://developers.facebook.com/docs/messenger-platform/send-messages#messaging_types
   * @param {*} recipientId
   * @param {*} imageUrl
   */
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

  /**
   * 发送一次性通知请求
   * https://developers.facebook.com/docs/messenger-platform/send-messages/one-time-notification
   * @param {*} recipientId
   * @param {*} replyMessage
   * @param {*} ref
   */
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

  /**
   * 发送一次性通知
   */
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

  /**
   * 获得用户的个人资料
   * https://developers.facebook.com/docs/messenger-platform/identity
   * @param {*} psid
   */
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
    // profile sample data
    //{
    //   "locale": "en_US",
    //   "first_name": "Hai Liang",
    //   "last_name": "Wang",
    //   "profile_pic": "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=4490913257587256&width=1024&ext=1608966959&hash=AeQjAiGr-n4SEAw5JME",
    //   "id": "xxxx"
    // }

    if (body.error) {
      debug('facebook api error %s', JSON.stringify(body.error, null, 2));
    }

    return body;
  }

  /**
   * Setting the Get Started Button Postback
   * https://developers.facebook.com/docs/messenger-platform/discovery/welcome-screen
   */
  async setGetStartedButton(payload) {
    let body = await got
      .post(FACEBOOK_MESSENGER_PROFILE_API, {
        searchParams: {
          access_token: this.access_token,
        },
        json: {
          get_started: { payload },
        },
      })
      .json();

    debug('[setGetStartedButton] pageId(%s), result', this.pageId, body);
  }

  /**
   * Set greeting text
   * https://developers.facebook.com/docs/messenger-platform/discovery/welcome-screen
   * @param {*} payload
   */
  async setGreetingText(greeting) {
    let body = await got
      .post(FACEBOOK_MESSENGER_PROFILE_API, {
        searchParams: {
          access_token: this.access_token,
        },
        json: {
          greeting,
        },
      })
      .json();

    debug('[setGreetingText] pageId(%s), result', this.pageId, body);
  }
}

const INSTANCES = {};

const facebookFactory = (pageId, account) => {
  let instance = INSTANCES[pageId];
  if (!instance) {
    let access_token = getAccessTokenByPageId(account, pageId);
    if (account) {
      instance = new FacebookService(pageId, access_token);
    } else {
      throw new Error('app %s account config not found.', pageId);
    }

    INSTANCES[pageId] = instance;
  }

  return instance;
};

/**
 * setup all accounts for me
 */
async function init() {
  debug('[init] setup facebook messenger bots with accounts');
  let defined = new Set();

  for (let x of config.accounts) {
    if (!x.pages) continue;
    for (let p of x.pages) {
      // facebook messenger 设置 get start button
      if (defined.has(p.pageId)) continue;
      let me = facebookFactory(p.pageId, x);
      await me.setGetStartedButton(DV_GET_START_TEXT);

      // facebook messenger 设置 greeting text
      let defaultLocale = _.get(x, 'localeDefault');
      let greeting = [
        {
          locale: 'default',
          text:
            defaultLocale && x?.chatopera[defaultLocale]?.custom
              ? x['chatopera'][defaultLocale]['custom']?.GREETING_TEXT ||
                DV_GREETING_TEXT
              : DV_GREETING_TEXT,
        },
      ];

      if (x.chatopera && typeof x.chatopera === 'object') {
        let locales = Object.keys(x.chatopera);
        for (let y of locales) {
          let g = {
            locale: y,
            text: x.chatopera[y].custom?.GREETING_TEXT,
          };
          if (g.text) greeting.push(g);
        }
      }

      await me.setGreetingText(greeting);
    }
  }
}

exports = module.exports = {
  getInstance: facebookFactory,
  init,
};
