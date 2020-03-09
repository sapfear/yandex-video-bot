<h1 align="center">Node.js Telegram Bot for Yandex Station&Module</h1>

<div align="center">

Node.js telegram bot to interact with [Yandex Station](https://yandex.ru/alice/station).

[![Bot API](https://img.shields.io/badge/Yandex%20Video%20Bot-v.0.0.1-00aced.svg?style=flat-square&logo=telegram)](https://github.com/sapfear/yandex-video-bot) [![https://telegram.me/sappfear](https://img.shields.io/badge/💬%20Telegram-sappfear-blue.svg?style=flat-square)](https://telegram.me/sappfear)

</div>

## Install

```bash
npm install --save node-telegram-bot-api
```

## Usage

First, you need create telegram bot with [@BotFather](https://telegram.me/botfather) and get bot token.

Second, you need change `WHITE_LIST` and `ADMIN_LOGIN` in [index.js](https://github.com/sapfear/yandex-video-bot/blob/master/index.js).

Finally, you can start you bot.

```bash
npm install
TOKEN=<your_bot_token> npm start
```

On start you need authorize by `/login` command.
After success login just send video href to bot or type `@vid` for search videos.


## Documentation

    WIP

## License

**The ISC License (ISC)**

Copyright © 2019 Sapfear
