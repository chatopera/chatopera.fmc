[![Docker Layers](https://images.microbadger.com/badges/image/chatopera/fmc:develop.svg)](https://microbadger.com/images/chatopera/fmc:develop "Image layers") [![Docker Version](https://images.microbadger.com/badges/version/chatopera/fmc:develop.svg)](https://microbadger.com/images/chatopera/fmc:develop "Image version") [![Docker Pulls](https://img.shields.io/docker/pulls/chatopera/fmc.svg)](https://hub.docker.com/r/chatopera/fmc/) [![Docker Stars](https://img.shields.io/docker/stars/chatopera/fmc.svg)](https://hub.docker.com/r/chatopera/fmc/) [![Docker Commit](https://images.microbadger.com/badges/commit/chatopera/fmc:develop.svg)](https://microbadger.com/images/chatopera/fmc:develop "Image CommitID")

# Chatopera FMC, Facebook Messenger Connector for Chatopera

Boot your bots in Facebook Messenger with [Chatopera](https://bot.chatopera.com/) in minutes.

![](./extras/images/1.png)

If you decide to launch a Messenger Bot on [Facebook Messenger Platform](https://developers.facebook.com/docs/messenger-platform) so that all your customers or target audiences can connect you via Facebook, you can run a software with source codes. There are many reasons to run a bot in such way, especially when you have technical skills, you want to leverage the most powerfull features in [Facebook Messenger Platform](https://developers.facebook.com/docs/messenger-platform).

As [Facebook Messenger Platform](https://developers.facebook.com/docs/messenger-platform) is changing and reshaping quickly, to use the latest APIs, you have to hands on and do some coding stuffs. Sometimes you want to intergates Facebook Messenger bot and other IT Systems like CRM, OA and 3rd party service together, the best way is starting your work with a project skeleton, this project skeleton has done some general functions. Or what you need to do is just making configurations and running it, later your business requirements changes or you want to make some modifications, you would like to touch the source codes and rebuild the software. [Chatopera FMC](https://github.com/chatopera/chatopera.fmc) fits into such purpose.

## Featured

- Services are running with docker containers
- Manage app status with [docker-compose](https://docs.docker.com/compose/install/)
- Integrated with [Chatopera Cloud Service](https://bot.chatopera.com) to customization your bot
  - Support image, button, generic templates
  - Build chat flows with Conversation Designer
  - Add FAQs in Web Portal
- Develop with Node.js, JavaScript

## Give me a demo

[https://www.facebook.com/chatopera.tech](https://www.facebook.com/chatopera.tech/)

Just click _Send Message_ to bring up the chatbox.

![](./extras/images/Chatopera_ME_demo.gif)

## Prerequisites

- [Facebook Account](https://developers.facebook.com/docs/messenger-platform/getting-started/sample-apps/original-coast-clothing)
  - Facebook Page
  - Facebook Developer Account
  - Facebook App:
- Facebook Page
- Chatopera Account
- Node.js 10+
- Text Editor or IDE for JavaScript
- Docker & Docker Compose

## Provision your bot service with Facebook Messenger and Chatopera FMC

### Create a Facebook Page

Just login facebook and then click [create](https://www.facebook.com/pages/creation/?ref_type=comet_home), you can design your page from here with a Designer Portal, very straight forward.

### Join Facebook Developers Program

Open [https://developers.facebook.com/apps](https://developers.facebook.com/apps) and register account.

### Create App in Facebook Developer Portal

![](./extras/images/2.png)

### Add Messenger from Products list

After your app is created, go to application detail page, from the left sidebar, find section of 'PRODUCTS'. Click '+' and filter 'Messenger', select it.

![](./extras/images/3.png)

Make sure you can see `Messenger` appears in your left sidebar now. Collapse `Messenger` and click `Settings`, scroll down this page and find `Add or Remove pages`, just fill in your page created previously.

Keep in mind, `Settings` of Developer Portal is a bridge that connect Your Facebook Page's Messenger Chatbox and [Chatopera FMC](https://github.com/chatopera/chatopera.fmc), these two components are core for your bot service. Your Messenger App would also be available from many other channles which implemented by Facebook Messenger.

Now, let's setup your [Chatopera FMC Instance](https://github.com/chatopera/chatopera.fmc), here, instance means a software running somewhere, such as your local Desktop or AWS Machines with these dependiences.

- Docker && Docker Compose, versions released after 2017.
- Access to Internet.
- HTTPS, [Chatopera FMC](https://github.com/chatopera/chatopera.fmc) would be requested by Facebook to receive messaging events. Many ways to accomplish it, I would suggest using [ngrok](https://dashboard.ngrok.com/get-started/setup) for beginners. I would demostrate how to use ngrok to setup HTTPS for [Chatopera FMC](https://github.com/chatopera/chatopera.fmc) later.

### Download

```
git clone https://github.com/chatopera/chatopera.fmc.git
```

### Configuration

```
cd chatopera.fmc
cp sample.env .env
```

### start ngrok

```
ngrok http 8555
```

![]()

## Contrib

Start to develop fmc project with [GUIDE](./fmc).

## References

[Requirements to deploy a Messenger app](https://developers.facebook.com/docs/messenger-platform/getting-started/sample-apps/original-coast-clothing)

[Build your first Messenger bot fast
](https://developers.facebook.com/docs/messenger-platform)

[Ngrok](https://dashboard.ngrok.com/)

## LICENSE

Copyright (2018-2020) <a href="https://www.chatopera.com/" target="_blank">北京华夏春松科技有限公司</a>

[Apache License Version 2.0](./LICENSE)

[![chatoper banner][co-banner-image]][co-url]

[co-banner-image]: https://static-public.chatopera.com/assets/images/42383104-da925942-8168-11e8-8195-868d5fcec170.png
[co-url]: https://www.chatopera.com
