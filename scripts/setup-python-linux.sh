#!/usr/bin/env bash
# Fetch a clean relocatable CPython into src-tauri/python-linux
# Does NOT leave pip packages installed — see python-linux/README.md
#
# Usage (from repo root, preferably on Linux):
#   chmod +x scripts/setup-python-linux.sh
#   ./scripts/setup-python-linux.sh
# ARM: ARCH=aarch64 ./scripts/setup-python-linux.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/src-tauri/python-linux"
ARCH="${ARCH:-x86_64}"
RELEASE="20250317"
PY_VER="3.12.9"

if [[ "$ARCH" == "aarch64" || "$ARCH" == "arm64" ]]; then
  ASSET="cpython-${PY_VER}+${RELEASE}-aarch64-unknown-linux-gnu-install_only.tar.gz"
else
  ASSET="cpython-${PY_VER}+${RELEASE}-x86_64-unknown-linux-gnu-install_only.tar.gz"
fi

URL="https://github.com/astral-sh/python-build-standalone/releases/download/${RELEASE}/${ASSET}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "==> Downloading $URL"
curl -L --fail -o "$TMP/python.tar.gz" "$URL"

echo "==> Extracting to $DEST"
rm -rf "$DEST"
mkdir -p "$DEST"
tar -xzf "$TMP/python.tar.gz" -C "$TMP"
if [[ -d "$TMP/python" ]]; then
  mv "$TMP/python"/* "$DEST"/
else
  FIRST="$(find "$TMP" -mindepth 1 -maxdepth 1 -type d | head -1)"
  mv "$FIRST"/* "$DEST"/
fi

chmod +x "$DEST/bin/"* 2>/dev/null || true

SP="$DEST/lib/python3.12/site-packages"
if [[ -d "$SP" ]]; then
  find "$SP" -mindepth 1 -maxdepth 1 ! -name 'README.txt' -exec rm -rf {} +
  printf '%s\n' "This site-packages folder is intentionally empty." "Install packages with pip after setup — see README.md." > "$SP/README.txt"
fi
rm -f "$DEST/bin"/pip "$DEST/bin"/pip3 "$DEST/bin"/pip3.* 2>/dev/null || true

if [[ -f "$ROOT/scripts/runtime-readmes/linux.md" ]]; then
  cp "$ROOT/scripts/runtime-readmes/linux.md" "$DEST/README.md"
fi

echo ""
echo "Clean Linux Python ready at: $DEST"
echo "Next: follow python-linux/README.md (ensurepip, then packages)."
"$DEST/bin/python3" -c "import sys; print(sys.version)" || true
