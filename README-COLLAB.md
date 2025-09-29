# GitHub 多人協作（教學版）

## A. 建立與初始化 Repo
```bash
git init
git add .
git commit -m "chore: bootstrap teaching kit"
git branch -M main
git remote add origin git@github.com:<your-account>/<repo>.git
git push -u origin main
```

## B. 邀請協作者
- GitHub → Repository → Settings → Collaborators → 邀請對方帳號
- 或把專案放在 Organization 並設定 Team 權限

## C. 開啟分支保護（Branch Protection）
- Settings → Branches → Add rule（指向 `main`）
  - ✅ Require a pull request before merging
  - ✅ Require status checks to pass before merging（勾選 `CI`）
  - ✅ Require approvals（至少 1 位）
- Settings → General → Pull Requests：只允許 **Squash merge**（歷史乾淨）

## D. 開發流程（GitHub Flow）
1. 從 `main` 開分支：`feature/<描述>`
2. 提交 PR → CI 綠燈 → Reviewer 核可
3. Squash merge 進 `main` → （可選）自動部署 Cloud Run

## E. 設定 GitHub Secrets（用 deploy-dev 範本）
- `GCP_SA_KEY`：Service Account JSON（開發期，正式改用 WIF）
- `GCP_PROJECT_ID`：GCP 專案 ID
- `GCP_REGION`：例如 `asia-east1`
- `GCP_AR_REPO`：Artifact Registry 倉庫名（例如 `hello-repo`）
- `CLOUD_RUN_SERVICE_DEV`：Cloud Run 服務名稱（例如 `hello-world-app`）

更多：看 `WIF-SETUP.md` 了解無金鑰 WIF 作法。
