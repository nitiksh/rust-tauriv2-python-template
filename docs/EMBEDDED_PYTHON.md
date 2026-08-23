# Embedded Python (cross-platform)

Shared app code lives in `python-app/` (tracked in git). Each OS **runtime is gitignored** and must be fetched with `scripts/setup-python-*` so GitHub never sees 100MB+ `libpython` binaries.

Rust resolves paths and runs:

```text
<python>  <python-app/app/main.py>  <command>  [args...]
```

Communication is **CLI + stdout** (string or JSON lines if you extend it).

## Fetch before build

| OS | Command |
|----|---------|
| Windows | `powershell -ExecutionPolicy Bypass -File scripts/setup-python-windows.ps1` |
| macOS | `./scripts/setup-python-macos.sh` |
| Linux | `./scripts/setup-python-linux.sh` |

Only each folder’s `README.md` is committed. Everything else under `python-windows/`, `python-macos/`, and `python-linux/` is local.

## Runtime sources

| Platform | Folder | Upstream |
|----------|--------|----------|
| Windows | `python-windows/` | [Official embeddable package](https://www.python.org/downloads/windows/) |
| macOS | `python-macos/` | [python-build-standalone](https://github.com/astral-sh/python-build-standalone) `install_only` |
| Linux | `python-linux/` | Same standalone builds (`gnu` install_only) |

Setup scripts live in `/scripts`.

## Tauri bundling

Base (`tauri.conf.json`):

```json
"resources": ["python-app"]
```

Platform overlays merge at build time:

- Windows → `python-windows` + `python-app`
- macOS → `python-macos` + `python-app`
- Linux → `python-linux` + `python-app`

Only the current OS runtime is packaged into that OS installer/app.

### Where resources land at runtime

| Platform | Typical resource root |
|----------|------------------------|
| Windows | Next to the `.exe` |
| Linux | Next to the binary |
| macOS | `YourApp.app/Contents/Resources/` |

`resolve_python_command()` in `lib.rs` accounts for this (and for `cargo tauri dev`).

## Clean runtimes (default)

Shipped folders contain the **interpreter only**. `site-packages` is empty until you install pip + deps. See each folder’s `README.md`.

## Windows embeddable checklist

1. Unzip embeddable amd64 build into `python-windows/` (or run `scripts/setup-python-windows.ps1`).
2. Ensure `python3XY._pth` contains:

```text
python3XY.zip
.
Lib
Scripts
import site
```

3. `python.exe get-pip.py`
4. `python.exe -m pip install -r python-app/requirements.txt`

Without `import site`, nothing in `Lib/site-packages` is importable.

## macOS / Linux standalone checklist

1. Download the matching `*-install_only.tar.gz` (or run the setup script).
2. Extract so you have `bin/python3`, `lib/`, etc.
3. Strip any bundled `pip` from `site-packages` if you want a clean tree (setup scripts do this).
4. `python3 -m ensurepip --upgrade` then `pip install -r python-app/requirements.txt`.
5. `chmod +x bin/python3`.

### Architectures

- macOS script defaults to **arm64** (Apple Silicon). Use `ARCH=x86_64` for Intel.
- Linux script defaults to **x86_64**. Use `ARCH=aarch64` for ARM servers/devices.
- Ship **one arch per build machine** (or build two artifacts). Cross-arch packaging is your CI problem, not something Tauri invents for you.

## Dev vs production path resolution

Order of preference (simplified):

1. Bundled path next to the exe / under `Contents/Resources`
2. Walk ancestors for `src-tauri/<runtime>` and `src-tauri/python-app/...`
3. Linux only: fall back to system `python3` if no bundled tree (handy for bare `cargo run` during early setup; **do not rely on this for release**)

## Extending the protocol

### Sync request/response (demo)

Return one string (or one JSON object) on stdout; Rust returns it to the UI.

### Streaming progress

Spawn with piped stdout, read line-by-line, `window.emit("event", line)` — same pattern as long-running downloaders. Keep a `Child` map if you need cancel/`kill`.

### Arguments and escaping

Prefer simple argv tokens. For complex data, pass a single JSON string argument or write a temp file and pass its path.

## What not to do

- Do not expect a shared venv across OSes.
- Do not hardcode `python.exe` in Rust — use `resolve_python_command()`.
- Do not put huge ML wheels in git without Git LFS or download-on-setup; keep `requirements.txt` as the source of truth and document fetch scripts.
- Do not use the Tauri shell plugin ACL for this bridge unless you choose to — `std::process::Command` does not need it.

## Related files

- `src-tauri/src/lib.rs` — resolver + `run_python`
- `src-tauri/python-app/app/main.py` — command dispatcher
- `src-tauri/python-app/requirements.txt` — app deps
- `scripts/setup-python-*.{ps1,sh}` — recreate runtimes
