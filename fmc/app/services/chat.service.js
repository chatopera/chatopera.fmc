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
  async chat(senderId, msg, isFaqClick) {
    debug(
      '[chat] user %s query %s on pageId(%s), isFaqClick %s',
      senderId,
      msg,
      this.pageId,
      isFaqClick
    );
    logic.handle({
      brain: this.brain,
      facebook: this.facebook,
      msgs: this.msgs,
      pageId: this.pageId,
      user: this.user,
      account: this.account,
      senderId,
      msg,
      isFaqClick,
    });
  }

  /**
   * 处理用户反馈: 有帮助，没有帮助
   * @param {*} senderId
   * @param {*} evaluationResults
   * @param {*} YorNId
   */
  async feedback(senderId, evaluationResults, YorNId) {
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

/**
 * chat 逻辑
 */
const Microloom = require('microloom');
const logic = new Microloom();

logic.use(async function (ctx, next) {
  ctx.response = await ctx.brain.conversationQuery(
    ctx.senderId,
    ctx.msg,
    config.FAQ_BEST_REPLY_THRESHOLD,
    config.FAQ_SUGG_REPLY_THRESHOLD
  );

  ctx.resolved = false;
  await next();
});

/**
 * 1) 兜底回复时，检查 faq 数据作为建议回复
 * 2) 否：next()
 */
logic.use(async function (ctx, next) {
  // 兜底回复，检查 FAQ
  if (!ctx.resolved && ctx.response.logic_is_fallback) {
    // if no faq data returns, bot would be silent.
    if (ctx.response.faq?.length > 0) {
      let faq = _.take(ctx.response.faq, 3);
      await ctx.facebook.sendButtonMessage(
        ctx.senderId,
        ctx.msgs.GUESS_MSG,
        _.map(faq, (f) => {
          return {
            type: 'postback',
            title: f.post,
            payload: `faq-${f.post}`,
          };
        })
      );
    }
    // 如果 ctx.response.faq 没有数据，此时 bot 不发送消息，保持沉默
    // 解决方案是：1）补充 FAQ；2）FAQ_SUGG_REPLY_THRESHOLD 尽量小，甚至为 0
    ctx.resolved = true;
  } else {
    await next();
  }
});

/**
 * 1) 检查回复字符串是否是 #in-params# 开头，如果是，处理 params
 * 2）否：next()
 */
logic.use(async function (ctx, next) {
  if (!ctx.resolved && ctx.response.string.startsWith("'#in-params#'")) {
    for (let p of ctx.response.params) {
      if (p.type == 'card') {
        await ctx.facebook.sendImageMessage(ctx.senderId, p.thumbnail);
      } else if (p.type == 'plain') {
        await ctx.facebook.sendTextMessage(ctx.senderId, p.text);
      }
    }
    ctx.resolved = true;
  } else {
    await next();
  }
});

/**
 * 1) 处理来自 FAQ 知识库的答案，设置为 postback 来获得反馈
 * 2) 不是来自 FAQ：next()
 */
logic.use(async function (ctx, next) {
  if (!ctx.resolved && ctx.response.service?.provider == 'faq') {
    let resultMsg = ctx.response.string + '\n\n' + ctx.msgs.HELPFUL_MSG;
    if (ctx.isFaqClick) {
      resultMsg = ctx.response.service?.post + '\n\n' + resultMsg;
    }

    let yesId = uuidv4();
    let noId = uuidv4();
    let body = await ctx.facebook.sendButtonMessage(ctx.senderId, resultMsg, [
      {
        type: 'postback',
        title: ctx.msgs.HELPFUL_FEEDBACK_YES_BTN,
        payload: 'feedback' + 'Y' + yesId,
      },
      {
        type: 'postback',
        title: ctx.msgs.HELPFUL_FEEDBACK_NO_BTN,
        payload: 'feedback' + 'N' + noId,
      },
    ]);
    let _messageId = body.message_id;
    await AnswerComment.create({
      userId: ctx.senderId,
      pageId: ctx.pageId,
      messageId: _messageId,
      yesId: yesId,
      noId: noId,
      comment: '',
      status: false,
      docId: ctx.response.service?.docId, //知识库问答对id
      question: ctx.response.service?.post, //知识库问题
      answer: ctx.response.string, //知识库答案
    });
    ctx.resolved = true;
  } else {
    await next();
  }
});

/**
 * 1) 处理来自多轮对话的 postback 消息，显示为按钮组件
 * 2) 否：next()
 */
logic.use(async function (ctx, next) {
  if (!ctx.resolved && ctx.response.service?.provider == 'conversation') {
    // 发送多轮对话里传送的列表消息
    let title = ctx.response.string;
    if (!title) title = ctx.msgs.GUESS_MSG;

    let payload = [];
    if (_.isArray(ctx.response.params) && ctx.response.params.length > 0) {
      for (let x of ctx.response.params) {
        if (x.type !== 'postback') continue;
        payload.push(x);
      }
    }

    if (payload.length > 0) {
      await ctx.facebook.sendButtonMessage(ctx.senderId, title, payload);
      ctx.resolved = true;
    }
  } else {
    await next();
  }
});

/**
 * 处理默认的 response string
 */
logic.use(async function (ctx, next) {
  if (!ctx.resolved && ctx.response.string) {
    await ctx.facebook.sendTextMessage(ctx.senderId, ctx.response.string);
    ctx.resolved = true;
  } else {
    await next();
  }
});

exports.create = async (pageId, userId) => {
  let instance = new ChatService(pageId, userId);
  await instance.init();
  return instance;
};
