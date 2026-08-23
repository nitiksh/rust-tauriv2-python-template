# Frontend (`ui/`)

React 19 + Vite 7 UI for the Tauri + embedded Python template.

```bash
cd ui
npm install
npm run dev
```

Normally you do not start Vite alone — `cargo tauri dev` runs `npm run dev` with `cwd` set to this folder via `tauri.conf.json`.

See the root [README](../Readme.md) for the full stack.
