# python-macos

This folder is **empty in git**. Fetch relocatable CPython locally — do not commit the runtime (too large for GitHub).

## 1. Download the runtime (required once)

On a **Mac**, from the repo root:

```bash
chmod +x scripts/setup-python-macos.sh
./scripts/setup-python-macos.sh
```

Intel Mac:

```bash
ARCH=x86_64 ./scripts/setup-python-macos.sh
```

| Item | Path |
|------|------|
| Interpreter | `bin/python3` |
| Shared lib | `lib/libpython3.12.dylib` |
| Site packages | `lib/python3.12/site-packages/` (empty until you install) |

## 2. Executable bit

```bash
chmod +x src-tauri/python-macos/bin/python3 src-tauri/python-macos/bin/python3.12
```

## 3. Install pip (once)

```bash
./src-tauri/python-macos/bin/python3 -m ensurepip --upgrade
./src-tauri/python-macos/bin/python3 -m pip install --upgrade pip
```

## 4. Install app packages

```bash
./src-tauri/python-macos/bin/python3 -m pip install -r src-tauri/python-app/requirements.txt
```

## Notes

- Prefer running the setup script **on macOS** (symlinks/permissions).
- Bundled via `tauri.macos.conf.json` under `Contents/Resources/python-macos/`.
