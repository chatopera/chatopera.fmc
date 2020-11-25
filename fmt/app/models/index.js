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
const config = require('../config');
const User = require('./user.model');
const AnswerComment = require('./answerComment.model');

mongoose.connect(
  config.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  function (err) {
    if (err) {
      console.error('connect to %s error: ', config.db, err.message);
      process.exit(1);
    }
  }
);

exports.User = User;
exports.AnswerComment = AnswerComment;
