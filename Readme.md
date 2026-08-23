# Tauri 2 + Embedded Python + React

> Cross-platform desktop app template — React UI, Rust backend, bundled CPython. No system Python required.

[![Tauri](https://img.shields.io/badge/Tauri-2.x-24C8DB?logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-stable-orange?logo=rust&logoColor=white)](https://rustup.rs)
[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Build desktop apps with a **React** frontend, **Tauri 2** shell, and **Python** logic — packaged as a single installer per platform. Python runs as a bundled subprocess (not PyO3), so you keep full access to the Python ecosystem without fighting in-process embedding.

---

## Features

- **Cross-platform** — Windows, macOS, and Linux with per-OS Python runtimes
- **Self-contained** — ships its own CPython; end users don't need Python installed
- **Simple bridge** — React `invoke()` → Rust command → Python CLI → stdout back to UI
- **Lightweight repo** — runtimes are downloaded locally (~25–450 MB each), not committed to git
- **Production-ready pattern** — platform Tauri configs, path resolution for dev + release, hidden console on Windows

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React (Vite)                                           │
│  invoke("add")  ·  invoke("add_name")  ·  invoke(...)   │
└───────────────────────────┬─────────────────────────────┘
                            │  Tauri IPC
┌───────────────────────────▼─────────────────────────────┐
│  Rust (lib.rs)                                          │
│  resolve_python_command()  →  std::process::Command     │
└───────────────────────────┬─────────────────────────────┘
                            │  subprocess
┌───────────────────────────▼─────────────────────────────┐
│  Bundled CPython  +  python-app/app/main.py             │
│  python-windows  ·  python-macos  ·  python-linux       │
└─────────────────────────────────────────────────────────┘
```

**Flow:** UI calls a Rust `#[tauri::command]` → Rust spawns `<python> main.py <cmd> [args]` → Python prints result to stdout → Rust returns it to React.

---

## Prerequisites

Install these once on your dev machine:

| Tool | Link |
|------|------|
| Rust (stable) | [rustup.rs](https://rustup.rs) |
| Node.js 18+ | [nodejs.org](https://nodejs.org) |
| Tauri CLI v2 | `cargo install tauri-cli --version "^2"` |

**Platform build tools** (required by Tauri):

- **Windows** — [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with C++ workload
- **macOS** — Xcode Command Line Tools (`xcode-select --install`)
- **Linux** — see [Tauri Linux deps](https://v2.tauri.app/start/prerequisites/#linux)

---

## Quick start

### 1. Clone

```bash
git clone https://github.com/nitiksh/rust-tauriv2-python-template.git
cd rust-tauriv2-python-template
```

### 2. Fetch Python for your OS

> **Required.** Runtimes are not in git (too large for GitHub). Each OS has a one-line setup script.

<details>
<summary><strong>Windows</strong></summary>

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-python-windows.ps1
```

Downloads embeddable CPython 3.12 into `src-tauri/python-windows/`.

</details>

<details>
<summary><strong>macOS</strong></summary>

```bash
chmod +x scripts/setup-python-macos.sh
./scripts/setup-python-macos.sh
```

Apple Silicon by default. Intel Mac:

```bash
ARCH=x86_64 ./scripts/setup-python-macos.sh
```

</details>

<details>
<summary><strong>Linux</strong></summary>

```bash
chmod +x scripts/setup-python-linux.sh
./scripts/setup-python-linux.sh
```

x86_64 by default. ARM64:

```bash
ARCH=aarch64 ./scripts/setup-python-linux.sh
```

</details>

### 3. Install frontend dependencies

```bash
cd ui
npm install
cd ..
```

### 4. Run in dev mode

```bash
cargo tauri dev
```

The demo app opens with three buttons: **Add**, **Print Name**, and **Python Info** — each calling Python through Rust.

### 5. Build for production

```bash
cargo tauri build
```

Output installer/app bundle includes your UI, Rust binary, `python-app/`, and the OS-specific Python runtime.

---

## Project structure

```
rust-tauriv2-python-template/
├── Readme.md                          ← you are here
├── LICENSE
├── docs/
│   └── EMBEDDED_PYTHON.md             ← deep dive: paths, bundling, extending
├── scripts/
│   ├── setup-python-windows.ps1       ← fetch Windows runtime
│   ├── setup-python-macos.sh          ← fetch macOS runtime
│   ├── setup-python-linux.sh          ← fetch Linux runtime
│   └── runtime-readmes/               ← copied into runtime folders by scripts
├── ui/                                ← React 19 + Vite 7 frontend
│   └── src/App.jsx
└── src-tauri/
    ├── src/lib.rs                     ← Python bridge (path resolver + commands)
    ├── tauri.conf.json                ← base config (resources: python-app)
    ├── tauri.windows.conf.json        ← adds python-windows to bundle
    ├── tauri.macos.conf.json          ← adds python-macos to bundle
    ├── tauri.linux.conf.json          ← adds python-linux to bundle
    ├── python-app/                    ← your Python code (tracked in git)
    │   ├── app/main.py                ← CLI dispatcher + demo functions
    │   ├── requirements.txt           ← app dependencies
    │   └── install.md
    ├── python-windows/README.md       ← setup guide (runtime fetched locally)
    ├── python-macos/README.md
    └── python-linux/README.md
```

---

## Install Python packages

After fetching the runtime, enable pip once, then install into **that OS tree only** (no shared venv):

<details>
<summary><strong>Windows</strong></summary>

```powershell
.\src-tauri\python-windows\python.exe .\src-tauri\python-windows\get-pip.py
.\src-tauri\python-windows\python.exe -m pip install -r .\src-tauri\python-app\requirements.txt
```

</details>

<details>
<summary><strong>macOS</strong></summary>

```bash
./src-tauri/python-macos/bin/python3 -m ensurepip --upgrade
./src-tauri/python-macos/bin/python3 -m pip install -r src-tauri/python-app/requirements.txt
```

</details>

<details>
<summary><strong>Linux</strong></summary>

```bash
./src-tauri/python-linux/bin/python3 -m ensurepip --upgrade
./src-tauri/python-linux/bin/python3 -m pip install -r src-tauri/python-app/requirements.txt
```

</details>

Add packages to `src-tauri/python-app/requirements.txt`, then re-run the pip install command for each OS you ship.

---

## Add your own Python function

### Step 1 — Python (`src-tauri/python-app/app/main.py`)

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

# Register in commands dict:
"greet": lambda: greet(sys.argv[2]) if len(sys.argv) > 2 else "Missing name",
```

### Step 2 — Rust (`src-tauri/src/lib.rs`)

```rust
#[tauri::command]
fn greet(name: String) -> Result<String, String> {
    run_python("greet", &[&name])
}

// Add to invoke_handler:
.invoke_handler(tauri::generate_handler![add, add_name, python_info, greet])
```

### Step 3 — React (`ui/src/App.jsx`)

```javascript
const result = await invoke("greet", { name: "World" });
```

See [docs/EMBEDDED_PYTHON.md](docs/EMBEDDED_PYTHON.md) for streaming progress, JSON protocols, and production tips.

---

## Why runtimes aren't in git

| Issue | Solution |
|-------|----------|
| GitHub 100 MB file limit | Linux `libpython3.12.so.1.0` alone is ~200 MB |
| Slow clones | Each runtime is 25–450 MB |
| Platform-specific binaries | Each OS fetches its own tree via setup script |

Only each folder's `README.md` is tracked. Everything else is gitignored and created locally by `scripts/setup-python-*`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Bundled Python not found` | Run the setup script for your OS (step 2 above) |
| `ModuleNotFoundError` in Python | Install packages into that OS runtime's pip |
| Frontend doesn't start | Run `npm install` inside `ui/` |
| Windows console flash | Already handled — Rust uses `CREATE_NO_WINDOW` |
| macOS `Permission denied` | `chmod +x src-tauri/python-macos/bin/python3` |
| Accidentally staged large files | Check `.gitignore`; never `git add -f python-linux/lib` |

---

## Stack

| Layer | Technology |
|-------|------------|
| UI | React 19, Vite 7 |
| Shell | Tauri 2 |
| Bridge | Rust (`std::process::Command`) |
| Logic | CPython 3.12 (embeddable / standalone) |

---

## License

[MIT](LICENSE) — use freely in personal and commercial projects.

---

**Author:** [Nitiksh](https://www.nitiksh.ntxm.org)
