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
const facebookService = require('./facebook.service');
const debug = require('debug')('fmt:service:chat');
const chatbotService = require('./chatopera.service');
const _ = require('lodash');
const { User, AnswerComment } = require('../models');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

const GUESS_MSG = '';
const HELPFUL_MSG = '';
const CLICK_YES_MSG = '';
const CLICK_NO_MSG = '';

class ChatService {
  constructor(appId, userId) {
    this.appId = appId;
    this.userId = userId;
  }

  async init() {
    this.facebook = facebookService.getInstance(this.appId);
    const user = await User.findById(this.userId).exec();
    this.chatbot = chatbotService.getInstance(this.appId, user?.locale);

    let account = _.find(config.accounts, { appId: this.appId });

    this.msgs = {
      GUESS_MSG,
      HELPFUL_MSG,
      CLICK_YES_MSG,
      CLICK_NO_MSG,
      ..._.get(account?.chatbot, user?.locale)?.config,
    };
  }

  query(senderId, key) {
    debug('user %s query %s on %s', senderId, key, this.appId);

    this.chatbotQuery(senderId, key).catch(console.error);
  }

  async syncUserLocale(psid) {
    let info = await this.facebook.getPersonProfile(psid);
    await User.findByIdAndUpdate(psid, { $set: info }, { upsert: true });
    await this.init();
  }

  async chatbotQuery(senderId, msg, isFaqClick) {
    debug(' user %s query msg', senderId, msg);

    let kickoffResult = await this.chatbot.conversationQuery(senderId, msg);

    if (kickoffResult.logic_is_fallback) {
      if (kickoffResult.faq?.length > 0) {
        let faq = _.take(kickoffResult.faq, 3);
        await this.facebook.sendButtonMessage(
          senderId,
          this.msgs.GUESS_MSG,
          _.map(faq, (f) => {
            return {
              type: 'postback',
              title: f.post,
              payload: `faq-${f.post}`,
            };
          })
        );
      }
    } else if (kickoffResult.string == '#in-params#') {
      for (let p of kickoffResult.params) {
        if (p.type == 'card') {
          await this.facebook.sendImageMessage(senderId, p.thumbnail);
        } else if (p.type == 'plain') {
          await this.facebook.sendTextMessage(senderId, p.text);
        }
      }
    } else if (kickoffResult.service?.provider == 'faq') {
      let resultMsg = kickoffResult.string + '\n\n' + this.msgs.HELPFUL_MSG;
      if (isFaqClick) {
        resultMsg = kickoffResult.service?.post + '\n\n' + resultMsg;
      }

      let yesId = uuidv4();
      let noId = uuidv4();
      let body = await this.facebook.sendButtonMessage(senderId, resultMsg, [
        {
          type: 'postback',
          title: 'Yes',
          payload: 'evaluate' + 'Y' + yesId,
        },
        {
          type: 'postback',
          title: 'No',
          payload: 'evaluate' + 'N' + noId,
        },
      ]);
      let _messageId = body.message_id;
      var answerComment = await AnswerComment.create({
        userId: senderId,
        appId: this.appId,
        messageId: _messageId,
        yesId: yesId,
        noId: noId,
        comment: '',
        status: false,
        docId: kickoffResult.service?.docId, //知识库问答对id
        question: kickoffResult.service?.post, //知识库问题
        answer: kickoffResult.string, //知识库答案
      });
      console.log(answerComment);
    } else {
      await this.facebook.sendTextMessage(senderId, kickoffResult.string);
    }
  }

  async commentQuery(senderId, evaluationResults, YorNId) {
    debug(' user %s query evaluationResults', senderId, evaluationResults);
    if (evaluationResults == 'Y') {
      let yesData = await AnswerComment.findOne({ yesId: YorNId });
      if (yesData?.status == true) {
        console.log('已评论过');
      } else {
        console.log('正在评价Yes');
        await this.facebook.sendTextMessage(senderId, this.msgs.CLICK_YES_MSG);
        let doc = await AnswerComment.findOne({ yesId: YorNId }).exec();
        doc.comment = 'Yes';
        doc.status = true;
        await doc.save();
      }
    } else if (evaluationResults == 'N') {
      let noData = await AnswerComment.findOne({ noId: YorNId });
      if (noData?.status == true) {
        console.log('已评论过');
      } else {
        console.log('正在评价No');
        await this.facebook.sendTextMessage(senderId, this.msgs.CLICK_NO_MSG);
        let doc = await AnswerComment.findOne({ noId: YorNId }).exec();
        doc.comment = 'No';
        doc.status = true;
        await doc.save();
      }
    }
  }

  async openThreadQuery(senderId, ref) {
    debug('user %s query ref %s', senderId, ref);
    this.facebook.sendOnetimeNotReq(senderId, '请一定通知我呀', ref);
  }

  async openThreadOkQuery(senderId, ref, payloadData) {
    debug('user %s query msg', senderId, ref, payloadData);
    // 保存到数据库 payloadData为链接参数
    console.log(payloadData);
    this.facebook.sendTextMessage(senderId, '感谢您的关注，上线之后会通知到您');
  }
}

exports.create = async (appId, userId) => {
  let instance = new ChatService(appId, userId);
  await instance.init();
  return instance;
};
