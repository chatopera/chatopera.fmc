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
const chatServiceCreate = require('../services/chat.service').create;
const debug = require('debug')('fmc:route:webhook');
const CONSTANTS = require('../miscs/constants');

exports.get_webhook = (ctx) => {
  ctx.body = ctx.request.query['hub.challenge'];
};

exports.post_webhook = async (ctx) => {
  let { object, entry } = ctx.request.body;
  debug('webhook body %s', JSON.stringify(entry, null, ' '));

  if (object == 'page') {
    for (let e of entry) {
      for (let messagingEvent of e.messaging) {
        debug('parse message event %o', messagingEvent);

        let senderId = messagingEvent.sender.id;
        let recipientId = messagingEvent.recipient.id;

        const chatService = await chatServiceCreate(recipientId, senderId);

        if (messagingEvent.referral?.type == 'OPEN_THREAD') {
          let ref = messagingEvent.referral.ref;
          chatService.openThreadQuery(senderId, ref);
        } else if (messagingEvent.optin?.type == 'one_time_notif_req') {
          let oneTimeNotifToken = messagingEvent.optin.one_time_notif_token;
          let payloadData = messagingEvent.optin.payload;
          chatService.openThreadOkQuery(
            senderId,
            oneTimeNotifToken,
            payloadData
          );
        } else if (/evaluate/.test(messagingEvent.postback?.payload)) {
          let evaluationResults = messagingEvent.postback?.payload.substring(
            8,
            9
          );
          let YorNId = messagingEvent.postback?.payload.substring(9);
          chatService.commentQuery(senderId, evaluationResults, YorNId);
        } else if (
          messagingEvent.postback?.payload == CONSTANTS.DV_GET_START_TEXT
        ) {
          await chatService.chat(senderId, messagingEvent.postback?.payload);
        } else if (/^faq-(.+)/.test(messagingEvent.postback?.payload)) {
          let match = messagingEvent.postback.payload.match(/^faq-(.+)/);
          if (match) {
            await chatService.chat(senderId, match[1], true);
          }
        } else {
          let msg = messagingEvent.message?.text;
          // let quick_reply = messagingEvent.message?.quick_reply?.payload;
          let postback = messagingEvent.postback?.payload;
          let final = postback ?? msg;

          // skip empty or undefined messages
          // https://github.com/chatopera/chatopera.fmc/issues/1
          if (final) await chatService.chat(senderId, final);
        }
      }
    }
  }

  ctx.body = '';
};
