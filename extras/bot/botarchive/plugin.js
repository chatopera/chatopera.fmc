/**
 * Chatopera FMC, Facebook Messenger Connector for Chatopera
 * Sample Bot
 */

let guide = [
  {
    type: "postback",
    title: "产品介绍",
    payload: "产品介绍",
  },
  {
    type: "postback",
    title: "体验技能",
    payload: "__me_skills",
  },
  {
    type: "postback",
    title: "业务联系",
    payload: "__contact_us",
  },
];

let defaultQuickReplies = [
  {
    content_type: "text",
    title: "体验技能",
    payload: "__me_skills",
  },
  {
    content_type: "text",
    title: "帮助",
    payload: "__me_get_help",
  },
];

// 用户绑定或新进入后，发送欢迎
exports.get_start = async function () {
  /**
   * 回传按钮参考文档
   * https://developers.facebook.com/docs/messenger-platform/reference/buttons/postback/
   */
  return {
    text: '随时发送"帮助"或"h"进入导航提示',
    params: {
      quick_replies: null,
      render: guide,
    },
  };
};

// 获得帮助信息
exports.get_help = async function () {
  return {
    text: "很高兴为您服务",
    params: {
      quick_replies: null,
      render: guide,
    },
  };
};

// 获得技能信息
exports.get_skills = async function () {
  return {
    text: "#generic#",
    params: {
      quick_replies: defaultQuickReplies,
      render: [
        {
          title: "讲笑话",
          image_url:
            "https://user-images.githubusercontent.com/3538629/100493226-1f877000-3170-11eb-8287-e1d7f8f57c45.png",
          subtitle: "逗您一乐，欢乐时刻。也可以发送“笑话”开始。",
          buttons: [
            {
              type: "postback",
              title: "来一个",
              payload: "__next_joke",
            },
          ],
        },
        {
          title: "猜数字",
          image_url:
            "https://user-images.githubusercontent.com/3538629/100493878-b9eab200-3176-11eb-8275-2195f54e9e70.png",
          subtitle:
            "每次我会先随机将1-100内的数字放在帽子里，您有 5 次机会猜这个数字是什么。也可以发送“猜数字”开始。",
          buttons: [
            {
              type: "postback",
              title: "玩一次",
              payload: "__kickoff_guess_num",
            },
          ],
        },
      ],
    },
  };
};

// 联系电话呼叫
exports.get_contact_us_btn = async function () {
  return {
    text: "#buttons# 业务联系",
    params: {
      quick_replies: defaultQuickReplies,
      render: [
        {
          type: "phone_number",
          title: "商务洽谈",
          payload: "+8613691490568",
        },
        {
          type: "postback",
          payload: "华夏春松获取发票",
          title: "发票",
        },
        {
          type: "web_url",
          url: "https://www.chatopera.com/mail.html",
          title: "投诉",
        },
      ],
    },
  };
};

// 介绍产品信息
exports.intro_products = async function () {
  return {
    text: "#generic#",
    params: {
      quick_replies: defaultQuickReplies,
      render: [
        {
          title: "春松客服",
          image_url:
            "https://user-images.githubusercontent.com/3538629/100455616-f4623980-30f9-11eb-87e0-bbc5b87c7e9a.png",
          subtitle: "多渠道智能客服",
          default_action: {
            type: "web_url",
            url: "https://docs.chatopera.com/products/cskefu/index.html",
            webview_height_ratio: "compact",
          },
          buttons: [
            {
              type: "postback",
              title: "简介",
              payload: "春松客服简介",
            },
            {
              type: "web_url",
              url: "https://docs.chatopera.com/products/cskefu/index.html",
              title: "文档中心",
            },
          ],
        },
        {
          title: "Chatopera 机器人平台",
          image_url:
            "https://user-images.githubusercontent.com/3538629/100456964-2379aa80-30fc-11eb-8c2e-ded400a58efc.png",
          subtitle: "定制聊天机器人",
          default_action: {
            type: "web_url",
            url: "https://docs.chatopera.com/products/chatbot-platform/",
            webview_height_ratio: "compact",
          },
          buttons: [
            {
              type: "postback",
              title: "简介",
              payload: "Chatopera 机器人平台简介",
            },
            {
              type: "web_url",
              url: "https://docs.chatopera.com/products/chatbot-platform/",
              title: "文档中心",
            },
          ],
        },
      ],
    },
  };
};

/**
 * 讲笑话
 */
const K_JOKES_TOLD = "jokes:told:";
const K_JOKES_EXPIRED = 3600 * 24; // 24 小时过期
// https://gitee.com/chatopera/chatbot-samples/raw/master/projects/%E5%B0%8F%E7%AC%91%E8%AF%9D/assets/jokes.json
const JOKES_DATA_URL = config["JOKES_DATA_URL"];
const JOKES_QUICK_REPLIES = [
  {
    content_type: "text",
    title: "下一个",
    payload: "__next_joke",
  },
  {
    content_type: "text",
    title: "不好笑",
    payload: "不好笑",
  },
  ...defaultQuickReplies,
];

const fetchJokes = async function () {
  debug("fetchJokes: fetch from remote url %s ...", JOKES_DATA_URL);
  let resp = await http.get(JOKES_DATA_URL);
  // debug("fetchJokes: ", resp.data)
  return resp.data;
};

exports.nextJoke = async function () {
  let uid = this.user.id;
  let K_UID_TOLD = K_JOKES_TOLD + uid;
  let told = await this.maestro.get(K_UID_TOLD);
  if (!told) told = "";

  let jokes = await fetchJokes();

  for (let x of jokes) {
    if (told.includes(x.id)) {
      continue;
    }
    told += `, ${x.id}`;
    this.maestro.set(K_UID_TOLD, told, K_JOKES_EXPIRED);
    return {
      text: x.content,
      params: {
        quick_replies: JOKES_QUICK_REPLIES,
      },
    };
  }

  return "{@__reply_no_more_joke_now}";
};

/**
 * 猜数字
 */
let rangeMax = 100;
let rangeMin = 1;
let turnMax = 5;

const secretKey = function (uid) {
  return "guess_num:secret:" + uid;
};

const turnKey = function (uid) {
  return "guess_num:turn:" + uid;
};

function getRandomInt(max, min) {
  return Math.floor(Math.random() * (max - min) + min);
}

function dropSession(maestro, uid) {
  maestro.del(secretKey(uid));
  maestro.del(turnKey(uid));
}

exports.regenSecretNumber = async function (min, max) {
  let secret = getRandomInt(max, min);
  rangeMax = max;
  rangeMin = min;
  debug("[regenSecretNumber] range [%s,%s], result %s", min, max, secret);
  this.maestro.set(secretKey(this.user.id), secret);
  this.maestro.set(turnKey(this.user.id), 0);

  return "";
};

exports.verifyInputAgainstSecret = async function (input) {
  let secret = await this.maestro.get(secretKey(this.user.id));
  let turn = await this.maestro.incrby(turnKey(this.user.id), 1);
  debug(
    "[verifyInputAgainstSecret] Turn %s, input %s, secret %s",
    turn,
    input,
    secret
  );

  if (typeof input === "string" && input.includes("重新开始")) {
    return "好的，我又放了一个数字，现在重新开始。 ^topicRedirect('guess_number', '__kickoff_guess_num')";
  }

  if (typeof input === "string" && input.includes("玩法")) {
    return "^topicRedirect('guess_number', '猜数字玩法')";
  }

  try {
    let inputNumber = Number(input);
    if (isNaN(inputNumber) || inputNumber < rangeMin || inputNumber > rangeMax)
      return `这不是一个数字, 请给我发送阿拉伯数字，范围 ${rangeMin} 到 ${rangeMax}。`;

    if (inputNumber == secret) {
      // It took you 2 turns to guess my number, which was 10.
      dropSession(this.maestro, this.user.id);
      return `{CLEAR} 太厉害了! 你在第 ${turn} 次猜中了, 这个数字是 ${secret}。`;
    } else if (inputNumber > secret) {
      if (turn == turnMax) {
        dropSession(this.maestro, this.user.id);
        return `{CLEAR} 抱歉，现在您在 5 次尝试后，没有猜中，这个数字是 ${secret}。 发送 "猜数字"，再玩一次。`;
      }

      return `您的数字${inputNumber}比谜底数字大，还有 ${
        turnMax - turn
      } 次机会。`;
    } else {
      if (turn == turnMax) {
        dropSession(this.maestro, this.user.id);
        return `{CLEAR} 抱歉，现在您在 5 次尝试后，没有猜中，这个数字是 ${secret}. 发送 "猜数字"，再玩一次。`;
      }

      return `您的数字${inputNumber}比谜底数字小，还有 ${
        turnMax - turn
      } 次机会。`;
    }
  } catch (e) {
    debug("error", e);
    return `这不是一个数字, 请给我发送阿拉伯数字，范围 ${rangeMin} 到 ${rangeMax}。`;
  }

  return "";
};
