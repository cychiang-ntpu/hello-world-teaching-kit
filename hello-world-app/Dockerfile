# =====================================
# 教學版 Dockerfile（多階段構建 + 中文註解）
# 目標：建立一個最小可用、較安全的 Node.js 執行環境
# 步驟：
#   1) deps 階段：安裝 node_modules（不包含 devDependencies）
#   2) runner 階段：使用較小的 slim 映像，拷貝必要檔案，使用非 root 身分啟動
# =====================================

# 1) 建置依賴階段：使用完整的 node 20 映像，方便安裝套件
FROM node:20-bookworm AS deps
WORKDIR /app

# 只複製 package.json / package-lock.json，讓 Docker 快取可重用
COPY package*.json ./

# 安裝 production 依賴（--omit=dev 排除 devDependencies）
RUN npm ci --omit=dev

# 2) 正式執行階段：使用較小的 Slim 映像，減少鏡像大小與攻擊面
FROM node:20-bookworm-slim AS runner

# 設定環境變數：生產模式 + 預設埠號（Cloud Run 會覆寫 PORT）
ENV NODE_ENV=production PORT=3000

# 建立一個非 root 使用者來執行 Node（安全性較佳）
RUN useradd -m -u 10001 nodeuser

WORKDIR /app

# 從 deps 階段複製已安裝好的 node_modules，避免在小映像再跑 npm install
COPY --from=deps /app/node_modules ./node_modules

# 複製應用程式檔案（server.js 與 package.json）
COPY server.js package*.json ./

# 對外開放 3000 埠（本地測試用；Cloud Run 不一定需要這行，但保留做教學）
EXPOSE 3000

# 切換到非 root 使用者
USER nodeuser

# 容器啟動時執行的指令
CMD ["node", "server.js"]
