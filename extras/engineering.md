<div align=right>

[Main](https://github.com/chatopera/chatopera.fmc)　|　[Bot Customization Guide](https://github.com/chatopera/chatopera.fmc/blob/master/extras/bot.md)　|　[Engineering](https://github.com/chatopera/chatopera.fmc/blob/master/extras/engineering.md)　|　[Get Help](https://docs.chatopera.com/products/chatbot-platform/support.html)

</div>

# Engineering

Enable more features with coding for [Chatopera FMC](https://github.com/chatopera/chatopera.fmc).

## Deps

- Nodejs 10+

## Install

```
cd fmc
./admin/install.sh
```

## Config

```
cd fmc
cp admin/sample.localrc admin/localrc
# edit admin/localrc
cp app/config/accounts.json app/config/accounts-dev.json
# edit app/config/accounts-dev.json
```

## Dev

```
cd fmc
./admin/dev.sh
```

The core source codes are `fmc/app/controllers/chat.controller.js` and `fmc/app/services/chat.service.js`.

## Build docker images

```
cd fmc
./admin/build.sh
```

## More docs

- [Facebook Messenger Platform Features](https://developers.facebook.com/docs/messenger-platform)

- [Chatopera SDKs and APIs](https://docs.chatopera.com/products/chatbot-platform/integration/index.html)

## LICENSE

Copyright (2018-2020) <a href="https://www.chatopera.com/" target="_blank">北京华夏春松科技有限公司</a>

[Apache License Version 2.0](../LICENSE)

[![chatoper banner][co-banner-image]][co-url]

[co-banner-image]: https://static-public.chatopera.com/assets/images/42383104-da925942-8168-11e8-8195-868d5fcec170.png
[co-url]: https://www.chatopera.com
