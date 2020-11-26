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
require('dotenv').config();

const Koa = require('koa');
const koaLogger = require('koa-logger');
const bodyParser = require('koa-bodyparser');

const config = require('./config');
const router = require('./routers');

const app = new Koa();
app.use(koaLogger());
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(config.PORT, async () => {
  let readlineq = require('readlineq');
  let banner = await readlineq('./config/banner.txt');
  for (let line of banner) {
    console.log(line);
  }
  console.log('server listening on port %s', config.PORT);
});

process.on('uncaughtException', function (err) {
  console.error(err);
});

process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection', err);
});
