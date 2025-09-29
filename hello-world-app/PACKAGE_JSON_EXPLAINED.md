# package.json 欄位說明（教學用）

- `name`：套件/專案名稱（可自訂，英數小寫與連字號為佳）。
- `version`：版本號（語意化版本建議 `MAJOR.MINOR.PATCH`）。
- `description`：專案簡述。
- `main`：預設進入點檔案（這裡是 `server.js`）。
- `scripts.start`：執行 `npm start` 時要跑的指令（在部署時 Cloud Run 會跑這個）。
- `dependencies`：執行時需要的套件（`express`）。
