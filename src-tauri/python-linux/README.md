# python-linux

This folder is **empty in git**. Fetch relocatable CPython locally — do not commit `libpython*.so*` or the rest of the tree (hundreds of MB; GitHub will reject or choke on them).

## 1. Download the runtime (required once)

On **Linux**, from the repo root:

```bash
chmod +x scripts/setup-python-linux.sh
./scripts/setup-python-linux.sh
```

ARM64:

```bash
ARCH=aarch64 ./scripts/setup-python-linux.sh
```

| Item | Path |
|------|------|
| Interpreter | `bin/python3` |
| Shared lib | `lib/libpython3.12.so.1.0` |
| Site packages | `lib/python3.12/site-packages/` (empty until you install) |

## 2. Executable bit

```bash
chmod +x src-tauri/python-linux/bin/python3 src-tauri/python-linux/bin/python3.12
```

## 3. Install pip (once)

```bash
./src-tauri/python-linux/bin/python3 -m ensurepip --upgrade
./src-tauri/python-linux/bin/python3 -m pip install --upgrade pip
```

## 4. Install app packages

```bash
./src-tauri/python-linux/bin/python3 -m pip install -r src-tauri/python-app/requirements.txt
```

## Notes

- Always run setup **on Linux** before `cargo tauri build`.
- Bundled via `tauri.linux.conf.json`.
- Never `git add` this folder’s binaries — they are gitignored on purpose.
