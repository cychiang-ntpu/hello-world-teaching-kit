# GitHub 多人協作教學（初學者友善版）

本文件適合剛接觸 Git 與 GitHub 的新手，帶你從安裝 Git、設定金鑰、專案初始化、上傳、邀請協作者，到分支協作與安全設定，每個指令都附上詳細註解與參數說明。

---

## 0. 安裝 Git 與設定 GitHub 金鑰

### 0-1. 安裝 Git

- 前往 [https://git-scm.com/](https://git-scm.com/) 下載並安裝 Git（Windows/Mac/Linux 都適用）。
- 安裝完成後，打開終端機（Terminal 或 PowerShell），輸入：

  ```bash
  git --version
  # 顯示 git 版本號代表安裝成功
  ```

### 0-2. 設定 GitHub SSH 金鑰（推薦）

1. **產生 SSH 金鑰：**

   ```bash
   ssh-keygen -t ed25519 -C "你的Email"
   # -t ed25519：指定金鑰型態（建議用 ed25519）
   # -C "你的Email"：加註說明（通常用你的 GitHub Email）
   ```

   > 產生過程會詢問儲存路徑（預設即可），也可設定密碼（可空白）。

2. **將公鑰加到 GitHub：**

   - 執行下列指令複製公鑰內容：

     ```bash
     cat ~/.ssh/id_ed25519.pub
     # 顯示公鑰內容，複製這一行
     ```

   - 登入 GitHub → 右上角大頭貼 → Settings → SSH and GPG keys → New SSH key  
     貼上剛剛複製的內容，儲存。

3. **測試連線：**

   ```bash
   ssh -T git@github.com
   # 第一次會問你是否信任，輸入 yes
   # 若看到 "Hi <你的帳號>! You've successfully authenticated..." 就成功了
   ```

---

## A. 建立與初始化 Repo

> **請先到 GitHub 網站建立 repository，再用下列指令連接與推送。**

### 步驟說明（圖文版）：

1. **登入 GitHub 網站**  
   前往 [https://github.com/](https://github.com/) 並登入你的帳號。

2. **建立新 Repository**  
   - 點選右上角「＋」按鈕，選擇「New repository」。
   - 在「Repository name」欄位輸入你的專案名稱（例如 `hello-world-teaching-kit`）。
   - 可以選擇 Public（公開）或 Private（私有）。
   - 其他選項（如 README、.gitignore）可以先不用勾選，保持預設即可。
   - 點選下方的「Create repository」按鈕。

3. **取得遠端網址**  
   - 建立完成後，GitHub 會顯示你的 repository 頁面。
   - 你會看到一個網址，例如：  
     `https://github.com/你的帳號/hello-world-teaching-kit.git`  
     或  
     `git@github.com:你的帳號/hello-world-teaching-kit.git`
   - 建議用 SSH 連線（需先設定金鑰），如果還沒設定可先用 HTTPS。

4. **複製「…or push an existing repository from the command line」區塊的指令**  
   - GitHub 會自動產生一組指令，方便你把本地專案推送上去。
   - 這些指令通常如下（請依你的 repository 網址調整）：

     ```bash
     git remote add origin git@github.com:你的帳號/hello-world-teaching-kit.git
     # 設定遠端倉庫位置

     git branch -M main
     # 將目前分支名稱改為 main（如果還沒改過）

     git push -u origin main
     # 將 main 分支推送到 GitHub，並建立追蹤關係
     ```

5. **推送成功後，重新整理 GitHub repository 頁面**  
   - 你會看到所有本地檔案已經出現在 GitHub 上。
   - 之後每次有新 commit，只要用 `git push` 就能同步到 GitHub。

---

### 小提醒

- **為什麼要先在 GitHub 建 repository？**  
  這樣可以確保遠端倉庫已經存在，推送時不會出現「遠端不存在」或「權限不足」等錯誤，也方便邀請協作者。
- **如果你還沒設定 SSH 金鑰，建議先完成「0-2. 設定 GitHub SSH 金鑰」步驟，這樣推送時不用每次輸入帳號密碼。**
- **如果你用 HTTPS 方式推送，GitHub 會要求你輸入帳號密碼（或 personal access token）。**

---

## B. 邀請協作者

1. 到 GitHub Repository 頁面
2. 點選右上角「Settings」→「Collaborators」
3. 輸入對方 GitHub 帳號，點選邀請（Add people）
4. 或將專案放在 Organization 並設定 Team 權限

---

## C. 開啟分支保護（Branch Protection）

1. 進入 Settings → Branches → Add rule（選擇 `main` 分支）
2. 建議勾選以下選項：
   - ✅ Require a pull request before merging（合併前必須開 PR）
   - ✅ Require status checks to pass before merging（PR 必須通過 CI）
   - ✅ Require approvals（至少 1 位 Reviewer 核可）
3. 進入 Settings → General → Pull Requests，建議只允許 **Squash merge**（讓 commit 歷史乾淨）

---

## D. 開發流程（GitHub Flow）

1. **從 `main` 開新分支：**
   ```bash
   git checkout -b feature/<描述>
   # checkout：切換分支
   # -b：建立新分支並切換過去
   # feature/<描述>：分支名稱（例如 feature/add-login）
   ```
2. **開發與提交：**
   ```bash
   git add .
   # 加入所有變更檔案到暫存區

   git commit -m "feat: 新增登入功能"
   # 提交變更，-m 後面是說明訊息

   git push origin feature/<描述>
   # 將新分支推送到 GitHub
   # origin 是遠端名稱，feature/<描述> 是分支名稱
   ```
3. **在 GitHub 上開 Pull Request（PR）**
4. **等待 CI 綠燈、Reviewer 核可**
5. **Squash merge 進 `main`**
6. （可選）自動部署到 Cloud Run

---

## E. 設定 GitHub Secrets（以 deploy-dev 為例）

在 GitHub Repository → Settings → Secrets and variables → Actions，新增下列 Secrets：

- `GCP_SA_KEY`：Service Account JSON（開發期，正式建議改用 WIF）
- `GCP_PROJECT_ID`：GCP 專案 ID
- `GCP_REGION`：例如 `asia-east1`
- `GCP_AR_REPO`：Artifact Registry 倉庫名（例如 `hello-repo`）
- `CLOUD_RUN_SERVICE_DEV`：Cloud Run 服務名稱（例如 `hello-world-app`）

> 更多安全部署方式，請參考 `WIF-SETUP.md` 了解無金鑰 WIF 作法。

---

## F. 常用 Git 指令（含參數說明）

```bash
git status
# 查看目前變更狀態

git add .
# 加入所有變更檔案到暫存區
# . 代表所有檔案

git commit -m "訊息"
# 提交變更，-m 後面是說明訊息

git pull
# 從遠端拉取最新變更並合併到本地分支

git push
# 推送本地變更到 GitHub

git checkout -b 新分支名
# 建立並切換到新分支
# -b 代表建立新分支
```

---

## G. 參考連結

- [Git 官方教學](https://git-scm.com/book/zh-tw/v2)
- [GitHub 新手入門](https://docs.github.com/zh/get-started/quickstart)
- [GitHub Actions 官方教學](https://docs.github.com/actions)

---
