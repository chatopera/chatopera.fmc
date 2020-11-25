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
const mongoose = require('mongoose');

const ModelSchema = new mongoose.Schema(
  {
    userId: { type: String },
    appId: { type: String, require: true },
    pageId: { type: String, require: true },
    messageId: String,
    yesId: String,
    noId: String,
    comment: String,
    status: Boolean,
    docId: String, //知识库问答对id
    question: String, //知识库问题
    answer: String, //知识库答案
  },
  { timestamps: true }
);

module.exports = exports = mongoose.model('answerComment', ModelSchema);
