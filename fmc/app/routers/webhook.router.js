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
const chatCtrl = require('../controllers/chat.controller');
const debug = require('debug')('fmc:route:webhook');

exports.get = (ctx) => {
  ctx.body = ctx.request.query['hub.challenge'];
};

exports.post = async (ctx) => {
  let { object, entry } = ctx.request.body;
  debug('webhook body %s', JSON.stringify(entry, null, ' '));

  if (object == 'page') {
    await chatCtrl.handlePageEntry(entry);
  }

  ctx.body = '';
};
