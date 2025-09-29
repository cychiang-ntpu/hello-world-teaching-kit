# Windows 全流程：安裝 Node 工具 → 本地跑一次 → 安裝雲端工具 → 設定 GCP → 部署 Hello World 到 Cloud Run

> **本教學適合完全沒用過 GCP 或 Cloud Run 的初學者。每一步都附註解，請照順序操作。**

---

## 1) 安裝 Node 工具
- **Node.js（含 npm）**：用來寫和執行 JavaScript 程式。  
  前往 https://nodejs.org/ 下載 LTS 版，安裝後在終端機輸入 `node -v` / `npm -v` 檢查是否安裝成功。
- **注意事項：**  
  如果你在 PowerShell 執行 `npm` 指令時出現「未經數位簽署」或「無法載入 npm.ps1」的錯誤，這是因為 PowerShell 預設有「執行原則」安全限制，為了防止惡意指令碼執行，會阻擋未簽署的指令碼（如 npm.ps1）。  
  你可以用以下指令暫時允許執行 npm：

  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```
  執行後，請重新開啟 PowerShell，再試一次 `npm -v`。  
  這樣就能正常使用 npm 指令了。  
  > **補充說明：**  
  > RemoteSigned 代表本機建立的指令碼可以執行，從網路下載的則需要有簽章。這是微軟用來保護使用者的機制，初學者只要照上述步驟設定即可安全使用 npm。

---

## 2) 本地跑一次

> **說明：**  
> 先在自己電腦上跑 Hello World，確定程式沒問題再部署到雲端。

```powershell
cd hello-world-app
# 進入你的 app 資料夾（請確認有 server.js 檔案）

npm install express
# 安裝 express 套件（Node.js 最常用的網頁伺服器）

node .\server.js
# 如果你是在 PowerShell 執行，請用 .\server.js（有 .\）
# 如果你是在 cmd（命令提示字元）執行，請用 node server.js（不用 .\）
```
> **小提醒：**  
> PowerShell 需要加上 `.\` 來指定目前資料夾的檔案，而 cmd 則直接輸入檔名即可。  
> 如果瀏覽器打不開 http://localhost:3000，請檢查 server.js 是否有設定正確的 PORT。

---

## 3) 安裝雲端工具

- **Google Cloud SDK（gcloud）**：用來操作 Google Cloud 的指令工具。  
  前往 https://cloud.google.com/sdk/docs/install 下載 Windows Installer。  
  安裝時請勾選「Add gcloud to PATH」（讓你在任何資料夾都能用 gcloud 指令）與「Run gcloud init after installation」（安裝完自動初始化）。
- **（可選）Docker Desktop**：如果你想在本地測試容器化，才需要安裝。  
  初學者可以先跳過。

---

## 4) 設定 GCP 專案與 API

> **說明：**  
> GCP（Google Cloud Platform）需要先登入帳號、選定專案，並啟用 Cloud Run 相關 API。

```powershell
gcloud auth login
# 登入 Google 帳號，授權 gcloud 工具

gcloud config set project <YOUR_PROJECT_ID>
# 設定你要操作的 GCP 專案，請用自己的專案 ID 取代 <YOUR_PROJECT_ID>

gcloud config set run/region asia-east1
# 設定 Cloud Run 預設部署區域（台灣）

gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
# 啟用 Cloud Run、Cloud Build、Artifact Registry 這三個服務
```
> **小提醒：**  
> 如果不知道自己的專案 ID，可以到 GCP 控制台首頁左上角找到。

---

## 5) 由雲端建置並部署 Cloud Run

> **說明：**  
> 這步會把你的程式打包成 Docker 容器，推到 GCP 的 Artifact Registry，再部署到 Cloud Run。

```powershell
# 一次性建立 Artifact Registry（只需做一次）
gcloud artifacts repositories create hello-repo --repository-format=docker --location=asia-east1

# 由 Cloud Build 建置鏡像並推送
gcloud builds submit --tag asia-east1-docker.pkg.dev/<YOUR_PROJECT_ID>/hello-repo/hello-world-app:latest ./hello-world-app
# <YOUR_PROJECT_ID> 請換成自己的專案 ID

# 部署到 Cloud Run（公開）
gcloud run deploy hello-world-app ^
  --image asia-east1-docker.pkg.dev/<YOUR_PROJECT_ID>/hello-repo/hello-world-app:latest ^
  --allow-unauthenticated ^
  --set-env-vars PORT=3000
# ^ 是 Windows 的換行符號，讓指令分多行寫
```
> **部署成功後：**  
> 終端機會顯示一個 HTTPS 連結，點開就能看到 Hello World！

---

## 6) 下一步

- 看 `README-COLLAB.md` 學習如何設定 GitHub 與另一位開發者協作
- 若要正式部署，建議改用 `WIF-SETUP.md` 的無金鑰方案，更安全

---

> **常見問題 Q&A：**
> - 如果遇到權限錯誤，請確認 GCP 帳號有「Cloud Run 管理員」角色。
> - 如果部署失敗，請檢查專案 ID、區域、API 是否都啟用。
> - Windows 指令如果出錯，請確認有用 PowerShell 或 CMD 執行。

---

> **補充：什麼是 Artifact Registry？**  
> Artifact Registry 是 Google Cloud 提供的「雲端儲存空間」，專門用來存放軟體建置出來的檔案（例如 Docker 容器映像檔、套件、程式庫等）。  
>  
> 在這個流程裡，當你用 Cloud Build 建好 Docker 容器後，這個容器會先被上傳到 Artifact Registry。Cloud Run 服務會從這裡抓取你的容器，然後在雲端啟動你的應用程式。  
>  
> **簡單來說：**  
> - Artifact Registry 就像「雲端倉庫」，幫你安全管理和分享建置好的程式檔案。  
> - 你可以在 GCP 控制台裡看到所有已上傳的映像檔，也能設定權限，決定誰可以存取。  
> - 這步驟是自動化部署流程中不可或缺的一環。
> - 想了解細節，請進一步看 [Artifact Registry overview](https://cloud.google.com/artifact-registry/docs?_gl=1*1afdyt8*_up*MQ..&gclid=CjwKCAjwuePGBhBZEiwAIGCVS6S22IgWd31LvF6vN_tSVeKjztDj3lWj4okQW1gv5NMZyPHAVw5ZoRoC_rsQAvD_BwE&gclsrc=aw.ds)
