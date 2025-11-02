// 使用chrome.webRequest API监听网络请求
chrome.webRequest.onCompleted.addListener(
  function(details) {
    // 分析请求是否安全
    const isSecure = details.url.startsWith('https:');
    const warningReasons = [];
    
    if (!isSecure) {
      warningReasons.push('使用了非加密的HTTP协议');
    }

    // 这里可以添加更多安全规则，例如：检测到已知恶意域名等

    // 将结果存储起来，供popup页面使用
    chrome.storage.local.get({securityLogs: []}, function(data) {
      const logs = data.securityLogs;
      logs.push({
        url: details.url,
        secure: isSecure,
        warningReasons: warningReasons,
        time: new Date().toLocaleString()
      });
      // 只保留最新50条记录
      if (logs.length > 50) logs.shift();
      chrome.storage.local.set({securityLogs: logs});
    });
  },
  {urls: ["<all_urls>"]} // 监听所有URL
);

// 接收来自popup页面的消息，返回安全日志
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getSecurityLogs") {
    chrome.storage.local.get({securityLogs: []}, function(data) {
      sendResponse({logs: data.securityLogs});
    });
    return true; // 表示会异步响应
  }
});