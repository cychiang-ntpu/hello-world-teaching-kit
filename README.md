# 教學版：Hello World（Node.js + Express + Docker）＋ GitHub 協作 ＋ Cloud Run 部署

這是一套專為**初學者**設計的最小可用專案，讓你從本地開發、多人協作、CI/CD 到雲端部署，一步步學會現代開發流程。

---

## 專案結構

- `hello-world-app/`：Node.js + Express 範例程式（含大量中文註解）
- `.github/workflows/`：CI（自動測試）與 CD（自動部署）範本，含詳細註解
- `QUICKSTART.md`：從安裝工具到部署的手把手教學（適合 Windows 初學者）
- `README-COLLAB.md`：如何用 GitHub 進行多人協作與版本控制
- `READMD-CI-CD.md`：如何設定 GitHub Actions CI/CD，並串接 GCP 自動部署
- `WIF-SETUP.md`：如何用 GCP Workload Identity Federation（WIF）無金鑰部署（正式建議）

---

## 建議閱讀順序

1. **`QUICKSTART.md`**  
   從零開始，學會本地開發、安裝工具、跑 Hello World、部署到 GCP Cloud Run。

2. **`README-COLLAB.md`**  
   學會如何把專案放到 GitHub、設定 SSH 金鑰、邀請協作者、開分支、發 PR，建立團隊協作基礎。

3. **`READMD-CI-CD.md`**  
   學會設定 GitHub Actions，讓每次 push/PR 都自動測試（CI）與自動部署（CD）到 GCP。  
   也會教你如何設定 GCP 權限、API、Service Account 及常見錯誤排查。

4. **（可選）`WIF-SETUP.md`**  
   進階安全部署：不用金鑰，直接用 GitHub OIDC 與 GCP WIF 進行自動部署，適合正式環境。

---

## 學習重點

- Node.js + Express 最小範例
- Docker 化應用程式
- Git/GitHub 版本控制與多人協作
- GitHub Actions 自動化測試與部署（CI/CD）
- GCP Cloud Run 雲端部署
- GCP 權限、API、Service Account、Artifact Registry 實務設定
- 無金鑰（WIF）自動部署最佳實踐

---

## 推薦學習流程

1. **本地開發與測試**  
   依 `QUICKSTART.md` 步驟，先在本地跑起來，熟悉 Node.js 與 Express。

2. **版本控制與協作**  
   依 `README-COLLAB.md`，把專案放到 GitHub，學會分支、PR、協作流程。

3. **自動化測試與部署**  
   依 `READMD-CI-CD.md`，設定 GitHub Actions，讓每次 push/PR 都自動測試與部署到 GCP。

4. **進階安全部署（可選）**  
   依 `WIF-SETUP.md`，改用 WIF 無金鑰部署，提升安全性。

---

## 參考文件

- [QUICKSTART.md](./QUICKSTART.md) — 本地開發與雲端部署教學
- [README-COLLAB.md](./README-COLLAB.md) — GitHub 版本控制與協作教學
- [READMD-CI-CD.md](./READMD-CI-CD.md) — CI/CD 與 GCP 自動部署教學
- [WIF-SETUP.md](./WIF-SETUP.md) — GCP WIF 無金鑰部署教學

---

> 建議依照上述順序學習，遇到問題可先查閱各教學文件的 Q&A 與常見錯誤排查章節。
