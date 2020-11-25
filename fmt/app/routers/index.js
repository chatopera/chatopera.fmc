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
const Router = require('koa-router');
const webhook = require('./webhook.router');

const router = new Router();

router.get('/webhook', webhook.get_webhook);
router.post('/webhook', webhook.post_webhook);

exports = module.exports = router;
