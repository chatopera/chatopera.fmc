/**
 * Chatopera FMC, Facebook Messenger Connector for Chatopera
 * Sample Bot
 */

exports.get_greetings = async function () {
  return {
    text: "#list# 很高兴为您服务",
    params: [
      {
        type: "plain",
        content: "产品介绍",
      },
      {
        type: "plain",
        content: "联系方式",
      },
    ],
  };
};
