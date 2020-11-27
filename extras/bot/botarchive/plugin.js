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
    text: "skills [development]",
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
