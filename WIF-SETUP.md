# Workload Identity Federation（WIF）無金鑰部署（建議）

1. 在 GCP 建立 Workload Identity Pool 與 Provider（來源：GitHub OIDC）。
2. 建立一個 Service Account，授予最小必要角色：
   - Cloud Run Admin
   - Cloud Build Service Account
   - Artifact Registry Writer
3. 將 Provider 綁定到此 Service Account（限制只允許你的 GitHub repo）。
4. 在 GitHub → Secrets 設定：
   - `GCP_WIF_PROVIDER`: `projects/<NUM>/locations/global/workloadIdentityPools/<POOL>/providers/<PROVIDER>`
   - `GCP_WIF_SA`: `<service-account>@<project-id>.iam.gserviceaccount.com`
5. 修改 workflow 的登入步驟：
```yaml
- uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: ${{ secrets.GCP_WIF_PROVIDER }}
    service_account: ${{ secrets.GCP_WIF_SA }}
```
