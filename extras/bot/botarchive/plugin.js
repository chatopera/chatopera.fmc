/**
 * Chatopera FMC, Facebook Messenger Connector for Chatopera
 * Sample Bot
 */

// 用户绑定或新进入后，发送欢迎
exports.get_greetings = async function () {
  /**
   * 回传按钮参考文档
   * https://developers.facebook.com/docs/messenger-platform/reference/buttons/postback/
   */
  return {
    text: "很高兴为您服务",
    params: [
      {
        type: "postback",
        title: "产品介绍",
        payload: "产品介绍",
      },
      {
        type: "postback",
        title: "联系方式",
        payload: "联系方式",
      },
    ],
  };
};
