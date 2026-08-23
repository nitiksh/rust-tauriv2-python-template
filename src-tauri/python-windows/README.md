# python-windows

This folder is **empty in git**. Fetch the Windows embeddable CPython locally — do not commit the runtime (too large for GitHub).

## 1. Download the runtime (required once)

From the **repo root**:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-python-windows.ps1
```

That creates `python.exe`, stdlib, and `get-pip.py` here. `python312._pth` is already set up with `import site`.

| Item | Path |
|------|------|
| Interpreter | `python.exe` |
| Stdlib | `python312.zip` + DLLs |
| Site packages | `Lib\site-packages\` (empty until you install) |
| pip bootstrap | `get-pip.py` |

## 2. Install pip (once)

```powershell
.\src-tauri\python-windows\python.exe .\src-tauri\python-windows\get-pip.py
```

```powershell
.\src-tauri\python-windows\python.exe -m pip --version
```

## 3. Install app packages

Edit `../python-app/requirements.txt`, then:

```powershell
.\src-tauri\python-windows\python.exe -m pip install -r .\src-tauri\python-app\requirements.txt
```

## Notes

- Install only into this folder — no system venv for the app.
- Bundled by `tauri.windows.conf.json`.
- Re-run step 1 anytime to get a clean interpreter again.
