/**
 * Util
 */

/**
 * 从所有 Account 中获得一个 pageId 的 account 信息
 * @param {*} accounts
 * @param {*} pageId
 */
function getAccountByPageId(accounts, pageId) {
  for (let x of accounts) {
    if (!x.pages) continue;
    for (let y of x.pages) {
      if (y.pageId === pageId) {
        return x;
      }
    }
  }
}

/**
 * 从 Account 中获得一个 pageId 的 access_token
 * @param {*} account
 * @param {*} pageId
 */
function getAccessTokenByPageId(account, pageId) {
  if (account.pages) {
    for (let x of account.pages) {
      if (x.pageId == pageId) {
        return x.access_token;
      }
    }
  }
}

exports = module.exports = {
  getAccountByPageId,
  getAccessTokenByPageId,
};
