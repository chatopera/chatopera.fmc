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
const { getAccessTokenByPageId } = require('../miscs/utils');

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
    let { body } = await got.post(FACEBOOK_MESSENGER_PROFILE_API, {
      searchParams: {
        access_token: this.access_token,
      },
      json: {
        get_started: { payload },
      },
    });

    debug('[setGetStartedButton] result', body);
  }

  /**
   * Set greeting text
   * https://developers.facebook.com/docs/messenger-platform/discovery/welcome-screen
   * @param {*} payload
   */
  async setGreetingText(greeting) {
    let { body } = await got.post(FACEBOOK_MESSENGER_PROFILE_API, {
      searchParams: {
        access_token: this.access_token,
      },
      json: {
        greeting,
      },
    });

    debug('[setGreetingText] result', body);
  }
}

const facebookInstance = {};
const facebookFactory = (pageId, account) => {
  let instance = facebookInstance[pageId];
  if (!instance) {
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
