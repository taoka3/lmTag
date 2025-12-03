// Background service worker
console.log("LMTAG background script loaded.");

chrome.runtime.onInstalled.addListener(() => {
  console.log("LMTAG installed.");
});
