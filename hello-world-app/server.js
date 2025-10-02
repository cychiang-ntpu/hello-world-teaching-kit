// ===============================
// 教學版 server.js（超詳細中文註解）
// 技術：Node.js + Express + Firebase Admin SDK
// 目標：提供三個主要功能：
//   1) GET /        -> 顯示 Hello World 首頁 (HTML)
//   2) GET /health  -> 健康檢查端點（給 Cloud Run / 負載平衡器探測用）
//   3) 註冊頁面與註冊表單處理（用 Firebase 建立帳號）
// ===============================

// 1) 匯入 express 套件（Web 伺服器框架）
//    Express 可以讓你很容易建立 HTTP 伺服器與路由
const express = require('express');

// 2) 匯入 Firebase Admin SDK
const admin = require('firebase-admin');

// 3) 初始化 Firebase Admin（需有 serviceAccountKey.json 憑證檔）
// const serviceAccount = require('./serviceAccountKey.json'); // 請將你的金鑰檔放在專案根目錄
const serviceAccount = require('./hello-world-register-firebase-adminsdk-fbsvc-048afc5730.json'); // 請將你的金鑰檔放在專案根目錄');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 4) 建立一個 Express 應用程式
//    app 物件就是你的 Web 伺服器
const app = express();

// 5) 加入中間件：讓 Express 能解析 POST 表單資料
//    express.urlencoded() 會解析 Content-Type: application/x-www-form-urlencoded 的請求（HTML 表單預設格式）
//    extended: true 代表可以解析巢狀物件（大多數情境都建議設 true）
app.use(express.urlencoded({ extended: true }));

// 6) 首頁路由：當用戶造訪根路徑 / 時，回傳一段 HTML
//    req 代表請求物件，res 代表回應物件
app.get('/', (req, res) => {
  // res.send() 會自動設定 Content-Type 並回傳字串/HTML
  res.send(`
    <h1>Hello World!</h1>
    <p>這是首頁。</p>
    <a href="/register">註冊帳號</a>
  `);
});

// 7) 健康檢查路由：雲端平台常用來確認服務是否正常
//    - 回傳 HTTP 200 代表健康
//    - 內容簡單即可（這裡回傳 'OK'）
//    - 常用於 Cloud Run、Kubernetes、負載平衡器的健康檢查
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 8) 註冊頁面（GET）：顯示一個簡單的註冊表單
//    用戶造訪 /register 時會看到這個表單
app.get('/register', (req, res) => {
  res.send(`
    <h1>註冊帳號</h1>
    <form method="POST" action="/register">
      <label>帳號（Email）：<input type="email" name="username" required></label><br>
      <label>密碼：<input type="password" name="password" required></label><br>
      <button type="submit">註冊</button>
    </form>
    <a href="/">回首頁</a>
  `);
});

// 9) 處理註冊表單（POST）：用 Firebase 建立新帳號
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    // 用 Firebase Admin 建立新使用者
    const userRecord = await admin.auth().createUser({
      email: username,
      password: password
    });
    res.send(`
      <h2>註冊成功！</h2>
      <p>帳號（Email）：${userRecord.email}</p>
      <a href="/">回首頁</a>
    `);
  } catch (error) {
    // 錯誤處理（如帳號已存在、密碼不符規則等）
    res.send(`
      <h2>註冊失敗</h2>
      <p>錯誤訊息：${error.message}</p>
      <a href="/register">回註冊頁</a>
    `);
  }
});

// 10) 決定伺服器監聽的埠號
//     - Cloud Run 會透過環境變數 PORT 告訴程式應該用哪個埠
//     - 本地開發沒有 PORT 時，就用 3000
const PORT = process.env.PORT || 3000;

// 11) 啟動伺服器，開始監聽指定的埠號
//     - 啟動後可以用 http://localhost:3000/ 造訪首頁
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
