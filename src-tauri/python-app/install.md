# Install packages into the embedded runtimes

Runtimes are **not in git**. Fetch yours first, then install packages into that OS tree only.

| Platform | Fetch | Then read |
|----------|--------|-----------|
| Windows | `scripts/setup-python-windows.ps1` | [python-windows/README.md](../python-windows/README.md) |
| macOS | `scripts/setup-python-macos.sh` | [python-macos/README.md](../python-macos/README.md) |
| Linux | `scripts/setup-python-linux.sh` | [python-linux/README.md](../python-linux/README.md) |

App code: `app/main.py`. Dependencies: `requirements.txt`.

```powershell
# Windows (after setup script)
.\src-tauri\python-windows\python.exe .\src-tauri\python-windows\get-pip.py
.\src-tauri\python-windows\python.exe -m pip install -r .\src-tauri\python-app\requirements.txt
```

```bash
# macOS / Linux (after setup script)
./src-tauri/python-macos/bin/python3 -m ensurepip --upgrade
./src-tauri/python-macos/bin/python3 -m pip install -r src-tauri/python-app/requirements.txt
```
