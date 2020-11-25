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
    _id: { type: String },
    appId: { type: String, require: true },
    locale: String,
    first_name: String,
    last_name: String,
    profile_pic: String,
  },
  { timestamps: true }
);

module.exports = exports = mongoose.model('User', ModelSchema);
