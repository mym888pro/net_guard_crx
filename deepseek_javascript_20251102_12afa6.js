document.addEventListener('DOMContentLoaded', function() {
  // 获取当前活动标签页
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    document.getElementById('currentStatus').innerHTML = `<p>正在检查: <strong>${currentTab.url}</strong></p>`;
  });

  // 从background.js获取安全日志并显示
  chrome.runtime.sendMessage({action: "getSecurityLogs"}, function(response) {
    displaySecurityLogs(response.logs);
  });
});

function displaySecurityLogs(logs) {
  const logsContainer = document.getElementById('securityLogs');
  logsContainer.innerHTML = '<h4>近期网络请求:</h4>';
  
  if (logs.length === 0) {
    logsContainer.innerHTML += '<p>暂无记录</p>';
    return;
  }

  // 显示最新的日志在最前面
  logs.slice().reverse().forEach(log => {
    const logElement = document.createElement('div');
    logElement.className = `log-item ${log.secure ? 'secure-log' : 'insecure-log'}`;
    
    let reasonsText = '';
    if (log.warningReasons.length > 0) {
      reasonsText = `<br><small>警告原因: ${log.warningReasons.join(', ')}</small>`;
    }
    
    logElement.innerHTML = `
      <div><strong>${log.secure ? '✅ 安全' : '❌ 不安全'}</strong></div>
      <div>URL: ${log.url}</div>
      <div>时间: ${log.time}${reasonsText}</div>
    `;
    logsContainer.appendChild(logElement);
  });
}