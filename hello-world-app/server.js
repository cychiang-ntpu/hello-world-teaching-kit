// ===============================
// 教學版 server.js（超詳細中文註解）
// 技術：Node.js + Express
// 目標：提供兩個路由
//   1) GET /        -> 顯示 Hello World (HTML)
//   2) GET /health  -> 健康檢查端點（給 Cloud Run / 負載平衡器探測用）
// ===============================

// 1) 匯入 express 套件（Web 伺服器框架）
const express = require('express');

// 2) 建立一個 Express 應用程式
const app = express();

// 3) 設定路由：當用戶造訪根路徑 / 時，回傳一段 HTML
app.get('/', (req, res) => {
  // res.send() 會自動設定 Content-Type 並回傳字串/HTML
  res.send('<h1>Hello World from Cloud Run!</h1><p>這是教學版 Hello World。</p>');
});

// 4) 健康檢查路由：雲端平台常用來確認服務是否正常
// - 回傳 HTTP 200 代表健康
// - 內容簡單即可（這裡回傳 'ok'）
app.get('/health', (req, res) => res.status(200).send('ok'));

// 5) 決定伺服器監聽的埠號
// - Cloud Run 會透過環境變數 PORT 告訴程式應該用哪個埠
// - 本地開發沒有 PORT 時，就用 3000
const PORT = process.env.PORT || 3000;

// 6) 啟動伺服器
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
