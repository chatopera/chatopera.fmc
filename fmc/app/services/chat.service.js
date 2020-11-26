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
const debug = require('debug')('fmc:service:chat');
const chatoperaService = require('./chatopera.service');
const _ = require('lodash');
const { User, AnswerComment } = require('../models');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const CONSTANTS = require('../miscs/constants');
const { getAccountByPageId } = require('../miscs/utils');

class ChatService {
  constructor(pageId, userId) {
    debug('chat service: pageId(%s), userId(%s)', pageId, userId);
    // quick retrieve infos independent from 3rd services
    this.pageId = pageId;
    this.userId = userId;
    this.account = getAccountByPageId(config.accounts, this.pageId);
    this.locale = null;
    this.user = null;
  }

  async init() {
    this.facebook = facebookService.getInstance(this.pageId, this.account);
    // reload user from db
    this.user = await User.findById(this.userId).exec();

    // not found, or no locale present, force re-sync
    if (this.user?.locale) {
      debug('user or user locale not present, force re-sync ...');
      this.user = this.syncUserLocale(this.userId);
    }

    this.locale =
      this.user?.locale || this.account?.localeDefault || CONSTANTS.DV_LOCALE;
    this.brain = chatoperaService.getInstance(
      this.pageId,
      this.locale,
      this.account
    );

    this.msgs = {
      GUESS_MSG: CONSTANTS.DV_GUESS_MSG,
      HELPFUL_MSG: CONSTANTS.DV_HELPFUL_MSG,
      HELPFUL_FEEDBACK_YES_BTN: CONSTANTS.DV_HELPFUL_FEEDBACK_YES_BTN,
      HELPFUL_FEEDBACK_NO_BTN: CONSTANTS.DV_HELPFUL_FEEDBACK_NO_BTN,
      CLICK_YES_MSG: CONSTANTS.DV_CLICK_YES_MSG,
      CLICK_NO_MSG: CONSTANTS.DV_CLICK_NO_MSG,
      ..._.get(this.account?.chatopera, this.locale)?.custom,
    };
  }

  chat(senderId, key) {
    debug('user %s query %s on pageId(%s)', senderId, key, this.pageId);
    this.chatbotConversationQuery(senderId, key).catch(console.error);
  }

  /**
   * retrieve user profile info from facebook, set into db
   * @param {*} psid
   * @param {*} init reinit chat service or not
   */
  async syncUserLocale(psid) {
    let profile = await this.facebook.getPersonProfile(psid);
    await User.findByIdAndUpdate(psid, { $set: profile }, { upsert: true });
    return profile;
  }

  /**
   * 请求多轮对话检索接口，处理返回值
   * @param {*} senderId
   * @param {*} msg
   * @param {*} isFaqClick
   */
  async chatbotConversationQuery(senderId, msg, isFaqClick) {
    debug('[chatbotConversationQuery] user %s query msg', senderId, msg);

    let response = await this.brain.conversationQuery(
      senderId,
      msg,
      config.FAQ_BEST_REPLY_THRESHOLD,
      config.FAQ_SUGG_REPLY_THRESHOLD
    );

    if (response.logic_is_fallback) {
      // if no faq data returns, bot would be silent.
      if (response.faq?.length > 0) {
        let faq = _.take(response.faq, 3);
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
    } else if (response.string == '#in-params#') {
      for (let p of response.params) {
        if (p.type == 'card') {
          await this.facebook.sendImageMessage(senderId, p.thumbnail);
        } else if (p.type == 'plain') {
          await this.facebook.sendTextMessage(senderId, p.text);
        }
      }
    } else if (response.service?.provider == 'faq') {
      let resultMsg = response.string + '\n\n' + this.msgs.HELPFUL_MSG;
      if (isFaqClick) {
        resultMsg = response.service?.post + '\n\n' + resultMsg;
      }

      let yesId = uuidv4();
      let noId = uuidv4();
      let body = await this.facebook.sendButtonMessage(senderId, resultMsg, [
        {
          type: 'postback',
          title: this.msgs.HELPFUL_FEEDBACK_YES_BTN,
          payload: 'evaluate' + 'Y' + yesId,
        },
        {
          type: 'postback',
          title: this.msgs.HELPFUL_FEEDBACK_NO_BTN,
          payload: 'evaluate' + 'N' + noId,
        },
      ]);
      let _messageId = body.message_id;
      var answerComment = await AnswerComment.create({
        userId: senderId,
        pageId: this.pageId,
        messageId: _messageId,
        yesId: yesId,
        noId: noId,
        comment: '',
        status: false,
        docId: response.service?.docId, //知识库问答对id
        question: response.service?.post, //知识库问题
        answer: response.string, //知识库答案
      });
      debug(answerComment);
    } else {
      await this.facebook.sendTextMessage(senderId, response.string);
    }
  }

  async commentQuery(senderId, evaluationResults, YorNId) {
    debug(' user %s query evaluationResults', senderId, evaluationResults);
    if (evaluationResults == 'Y') {
      let yesData = await AnswerComment.findOne({ yesId: YorNId });
      if (yesData?.status == true) {
        debug('已评论过');
      } else {
        debug('正在评价Yes');
        await this.facebook.sendTextMessage(
          senderId,
          _.sample(this.msgs.CLICK_YES_MSG)
        );
        let doc = await AnswerComment.findOne({ yesId: YorNId }).exec();
        doc.comment = 'Yes';
        doc.status = true;
        await doc.save();
      }
    } else if (evaluationResults == 'N') {
      let noData = await AnswerComment.findOne({ noId: YorNId });
      if (noData?.status == true) {
        debug('已评论过');
      } else {
        debug('正在评价No');
        await this.facebook.sendTextMessage(
          senderId,
          _.sample(this.msgs.CLICK_NO_MSG)
        );
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
    debug(payloadData);
    this.facebook.sendTextMessage(senderId, '感谢您的关注，上线之后会通知到您');
  }
}

exports.create = async (pageId, userId) => {
  let instance = new ChatService(pageId, userId);
  await instance.init();
  return instance;
};
