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
const debug = require('debug')('fmc:ctrl:chat');
const chatServiceCreate = require('../services/chat.service').create;
const CONSTANTS = require('../miscs/constants');

/**
 * 处理 FB Webhook 消息事件
 * @param {*} entry
 */
async function handlePageEntry(entry) {
  for (let e of entry) {
    for (let messagingEvent of e.messaging) {
      debug('parse message event %o', messagingEvent);

      let senderId = messagingEvent.sender.id;
      let recipientId = messagingEvent.recipient.id;

      const chatService = await chatServiceCreate(recipientId, senderId);

      let action = dispatch(messagingEvent);

      switch (action) {
        case 'OPEN_THREAD_QUERY':
          let ref = messagingEvent.referral.ref;
          chatService.openThreadQuery(senderId, ref);
          break;
        case 'OPEN_THREAD_OK_QUERY':
          let oneTimeNotifToken = messagingEvent.optin.one_time_notif_token;
          let payloadData = messagingEvent.optin.payload;
          chatService.openThreadOkQuery(
            senderId,
            oneTimeNotifToken,
            payloadData
          );
          break;
        case 'FEEDBACK':
          let evaluationResults = messagingEvent.postback?.payload.substring(
            8,
            9
          );
          let YorNId = messagingEvent.postback?.payload.substring(9);
          chatService.feedback(senderId, evaluationResults, YorNId);
          break;
        case 'GET_START':
          await chatService.chat(senderId, messagingEvent.postback?.payload);
          break;
        case 'POSTBACK_PAYLOAD_FAQ':
          let match = messagingEvent.postback.payload.match(/^faq-(.+)/);
          if (match) {
            await chatService.chat(senderId, match[1], true);
          }
          break;
        case 'FALLBACK':
          let msg = messagingEvent.message?.text;
          // let quick_reply = messagingEvent.message?.quick_reply?.payload;
          let postback = messagingEvent.postback?.payload;
          let final = postback ?? msg;

          // skip empty or undefined messages
          // https://github.com/chatopera/chatopera.fmc/issues/1
          if (final) await chatService.chat(senderId, final);
          break;
        default:
          console.log('WARN: [chat] unknown event action', messagingEvent);
          break;
      }
    }
  }
}

/**
 * 路由消息负载到不同处理策略
 * @param {*} event
 */
function dispatch(event) {
  let action = '';

  if (event.referral?.type == 'OPEN_THREAD') {
    action = 'OPEN_THREAD_QUERY';
  } else if (event.optin?.type == 'one_time_notif_req') {
    action = 'OPEN_THREAD_OK_QUERY';
  } else if (/evaluate/.test(event.postback?.payload)) {
    action = 'FEEDBACK';
  } else if (event.postback?.payload == CONSTANTS.DV_GET_START_TEXT) {
    action = 'GET_START';
  } else if (/^faq-(.+)/.test(event.postback?.payload)) {
    action = 'POSTBACK_PAYLOAD_FAQ';
  } else {
    action = 'FALLBACK';
  }
  return action;
}

exports = module.exports = {
  handlePageEntry,
};
