# GitHub Actions CI/CD 設定教學（以本專案為例）

本文件說明如何用 GitHub Actions 設定 CI（持續整合）與 CD（持續部署），並對應本專案的 `ci.yml` 及 `deploy-dev.yml`。

---

## 什麼是 CI/CD？

- **CI（Continuous Integration，持續整合）**：每次 push 或 PR 時，自動建置、測試你的程式碼，確保品質。
- **CD（Continuous Delivery/Deployment，持續交付/部署）**：程式碼通過測試後，自動部署到雲端或伺服器。

---

## CI 設定說明（ci.yml）

CI 設定檔位於 `.github/workflows/ci.yml`，主要流程如下：

1. **觸發時機**
   - 當有 PR 指向 `main` 分支，或直接 push 到 `main` 分支時自動執行。

2. **主要步驟**
   - 取得程式碼（checkout）
   - 用 Docker 建立映像檔
   - 用 Docker 執行簡單測試（煙霧測試）

3. **ci.yml 範例與參數說明**

   ```yaml
   name: CI
   on:
     pull_request:
       branches: [ "main" ]   # PR 目標 main 分支時觸發
     push:
       branches: [ "main" ]   # 直接 push 到 main 分支時也觸發
   jobs:
     test:
       runs-on: ubuntu-latest  # 使用 Ubuntu Linux runner

       steps:
         - name: 取得程式碼
           uses: actions/checkout@v4
           # 下載你的 repository 程式碼到 runner

         - name: 建立 Docker 映像（hello-world-app）
           run: docker build -t hello-world-app ./hello-world-app
           # -t hello-world-app：映像檔名稱
           # ./hello-world-app：Dockerfile 與程式碼目錄

         - name: 使用 Docker 執行煙霧測試
           run: docker run --rm hello-world-app node -e "console.log('ci ok')"
           # --rm：容器結束後自動刪除
           # node -e ...：在容器內執行簡單測試
   ```

---

## CD 設定說明（deploy-dev.yml）

CD 設定檔位於 `.github/workflows/deploy-dev.yml`，主要流程如下：

1. **觸發時機**
   - 通常設定為 push 到特定分支（如 `main` 或 `dev`），或 PR 合併後自動部署。

2. **主要步驟**
   - 取得程式碼（checkout）
   - 登入 Google Cloud（通常用 service account 或 WIF）
   - 用 Cloud Build 建置並推送 Docker 映像到 Artifact Registry
   - 部署映像到 Cloud Run

3. **deploy-dev.yml 範例與參數說明**  
   （以下為常見流程，實際內容請參考你的 deploy-dev.yml）

   ```yaml
   name: Deploy to Cloud Run (Dev)
   on:
     push:
       branches: [ "main" ]   # 只要 push 到 main 就自動部署

   jobs:
     deploy:
       runs-on: ubuntu-latest

       steps:
         - name: 取得程式碼
           uses: actions/checkout@v4

         - name: 設定 GCP 認證
           uses: google-github-actions/auth@v2
           with:
             credentials_json: ${{ secrets.GCP_SA_KEY }}
           # 用 GitHub Secrets 儲存 GCP Service Account 金鑰

         - name: 設定 gcloud CLI
           uses: google-github-actions/setup-gcloud@v2
           with:
             project_id: ${{ secrets.GCP_PROJECT_ID }}
             install_components: 'beta'

         - name: 建置並推送映像到 Artifact Registry
           run: |
             gcloud builds submit --tag asia-east1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/${{ secrets.GCP_AR_REPO }}/hello-world-app:latest ./hello-world-app

         - name: 部署到 Cloud Run
           run: |
             gcloud run deploy ${{ secrets.CLOUD_RUN_SERVICE_DEV }} \
               --image asia-east1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/${{ secrets.GCP_AR_REPO }}/hello-world-app:latest \
               --region ${{ secrets.GCP_REGION }} \
               --allow-unauthenticated
   ```

   - `${{ secrets.XXX }}`：這些值建議設在 GitHub Secrets 裡，避免金鑰外洩。
   - `gcloud builds submit`：用 Cloud Build 建置並推送映像
   - `gcloud run deploy`：部署到 Cloud Run

---

## 如何啟用 CI/CD？

1. **建立 `.github/workflows/ci.yml` 與 `deploy-dev.yml`**  
   內容可參考上方範例，或直接複製本專案的檔案。

2. **設定 GitHub Secrets**  
   到 GitHub repository → Settings → Secrets and variables → Actions，新增下列 Secrets（這些是自動部署到 GCP 需要用到的機密資訊）：

   - `GCP_SA_KEY`：**Google Cloud Service Account 金鑰**  
     這是一段 JSON 內容，代表你的 GCP 機器人帳號授權。請到 GCP IAM 服務帳號頁面建立金鑰，下載 JSON 檔，然後把內容貼到這個 Secret。

   - `GCP_PROJECT_ID`：**GCP 專案 ID**  
     你的 Google Cloud 專案的唯一識別字串（不是專案名稱），例如 `hello-world-app-123456`。可在 GCP 控制台首頁左上角找到。

   - `GCP_REGION`：**GCP 部署區域**  
     你要部署 Cloud Run 的地區，例如 `asia-east1`（台灣），或 `us-central1`（美國中部）。

   - `GCP_AR_REPO`：**Artifact Registry 倉庫名稱**  
     你在 GCP Artifact Registry 建立的 Docker 倉庫名稱，例如 `hello-repo`。

   - `CLOUD_RUN_SERVICE_DEV`：**Cloud Run 服務名稱**  
     你要部署的 Cloud Run 服務名稱，例如 `hello-world-app`。

   > 這些 Secrets 只需設定一次，之後 workflow 會自動讀取。請勿將這些機密資訊寫在程式碼或公開文件中。

3. **推送程式碼到 main 分支**  
   - CI 會自動建置與測試
   - 通過後，CD 會自動部署到 Cloud Run

---

## 參考連結

- [GitHub Actions 官方教學](https://docs.github.com/actions)
- [Google Cloud Build 官方說明](https://cloud.google.com/build/docs)
- [Google Cloud Run 官方說明](https://cloud.google.com/run/docs)

---