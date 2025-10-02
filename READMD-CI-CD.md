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

## GCP 權限與服務設定說明（避免自動部署權限錯誤）

為了讓 GitHub Actions 能順利自動建置與部署到 GCP（Google Cloud Platform），你必須在 GCP 控制台完成以下設定，否則會遇到權限不足、無法存取 Cloud Build、Artifact Registry 或 Cloud Run 等錯誤。

---

### 1. 啟用必要的 GCP API

請在 GCP 控制台啟用下列 API（「API 與服務」→「已啟用的 API 與服務」→「啟用 API」）：

- **Cloud Build API**：讓 workflow 可以用 `gcloud builds submit` 建置與推送映像檔。
- **Artifact Registry API**：讓 workflow 可以儲存與管理 Docker 映像檔。
- **Cloud Run API**：讓 workflow 可以部署與管理 Cloud Run 服務。

---

### 2. 建立並設定 Service Account

1. 到「IAM 與管理員」→「服務帳號」建立一個新的 Service Account（或使用現有的）。
2. 為這個 Service Account 新增下列角色（權限）：
   - **Cloud Build Editor**（roles/cloudbuild.builds.editor）：允許建置與管理 Cloud Build。
   - **Storage Admin** 或 **Storage Object Admin**（roles/storage.admin 或 roles/storage.objectAdmin）：允許 Cloud Build 存取 GCS bucket（如 `<project-id>_cloudbuild`）。
   - **Artifact Registry Administrator**（roles/artifactregistry.admin）：允許推送與拉取 Docker 映像檔。
   - **Cloud Run Admin**（roles/run.admin）：允許部署與管理 Cloud Run 服務。
   - **Service Usage User**（roles/serviceusage.serviceUsageConsumer）：允許啟用與使用 GCP API。
   - **Viewer**（roles/viewer）：允許 workflow 串流與讀取建置日誌（避免 Cloud Build 日誌權限錯誤）。

> 你可以在「IAM」頁面找到 Service Account，點「編輯」→「新增角色」來設定。

---

### 3. 建立 Service Account 金鑰

1. 在「服務帳號」頁面，選擇你的 Service Account，點「管理金鑰」。
2. 點「新增金鑰」→ 選擇「JSON」→ 按「建立」。
3. 下載下來的 JSON 檔案內容，就是你要貼到 GitHub Secrets 的 `GCP_SA_KEY`。

---

### 4. 將金鑰與專案資訊設到 GitHub Secrets

請參考本教學前述說明，將下列資訊設到 GitHub repository 的 Settings → Secrets and variables → Actions：

- `GCP_SA_KEY`：剛剛下載的 Service Account 金鑰（JSON 內容）
- `GCP_PROJECT_ID`：你的 GCP 專案 ID
- `GCP_REGION`：部署區域（如 asia-east1）
- `GCP_AR_REPO`：Artifact Registry 倉庫名稱
- `CLOUD_RUN_SERVICE_DEV`：Cloud Run 服務名稱

---

### 5. 為什麼要這樣設定？

- **Cloud Build** 需要有權限存取 GCS bucket 來暫存建置檔案，否則會出現「forbidden from accessing the bucket」等錯誤。
- **Artifact Registry** 需要權限才能推送/拉取映像檔。
- **Cloud Run** 需要權限才能自動部署。
- **Service Usage User** 讓 Service Account 能夠使用這些 API。
- **Viewer** 讓 workflow 可以串流與讀取 Cloud Build 日誌，否則 workflow 只會顯示錯誤但無法即時看到詳細日誌。

---

### 6. 常見錯誤與排查

- **forbidden from accessing the bucket**  
  → Service Account 權限不足，請檢查是否有 Storage Admin/Cloud Build Editor/Service Usage User/Viewer 等角色。
- **API not enabled**  
  → 請確認 Cloud Build、Artifact Registry、Cloud Run API 都已啟用。
- **無法部署到 Cloud Run**  
  → 請確認 Service Account 有 Cloud Run Admin 權限。
- **Cloud Build 日誌無法串流**  
  → 請確認 Service Account 有 Viewer 權限，或依官方建議設定自訂 logs bucket 並調整 VPC-SC 規則。

---

> 完成以上設定後，GitHub Actions workflow 就能順利自動建置與部署到 GCP，不會再遇到權限相關錯誤。

---

## 常見 GCP 權限錯誤與解決方法

### 問題：Cloud Run 部署權限不足

**錯誤訊息範例：**
```
ERROR: (gcloud.run.deploy) PERMISSION_DENIED: Permission 'run.services.update' denied on resource 'namespaces/***/services/***' (or resource may not exist). This command is authenticated as cychiang-ntpu@***.iam.gserviceaccount.com using the credentials in ...json, specified by the [auth/credential_file_override] property.
```

**原因說明：**
- 你的 Service Account 沒有 `run.services.update` 權限，這是 Cloud Run 服務部署（建立或更新）所必須的權限。

---

### 解決方法

1. **到 GCP 控制台 → IAM 與管理員 → IAM**
2. 找到你 workflow 用的 Service Account
3. 點「編輯」並新增下列角色之一：
   - `Cloud Run Admin`（roles/run.admin）**→ 建議**
   - 或至少 `Cloud Run Developer`（roles/run.developer`，但 admin 權限較完整）
4. 儲存後，重新執行 GitHub Actions workflow

---

#### 權限說明

- `Cloud Run Admin` 角色包含 `run.services.update` 權限，能讓 Service Account 建立、更新、刪除 Cloud Run 服務。
- 如果只給了 Cloud Run Viewer 或其他角色，則無法部署或更新服務。

---

> 請務必確認 Service Account 有正確的 Cloud Run 權限，否則 workflow 會因權限不足而部署失敗。

---

## 參考連結

- [GitHub Actions 官方教學](https://docs.github.com/actions)
- [Google Cloud Build 官方說明](https://cloud.google.com/build/docs)
- [Google Cloud Run 官方說明](https://cloud.google.com/run/docs)

---