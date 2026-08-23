"""Cross-platform Python entrypoint for the Tauri template.

Rust invokes this script as:
  <python> main.py <command> [args...]

Add new commands in `commands` below, then expose a matching #[tauri::command]
in src-tauri/src/lib.rs.
"""

from __future__ import annotations

import platform
import sys


def add() -> str:
    return "Addition: 5 + 3 = 8"


def printname(name: str) -> str:
    return "Name: " + name


def info() -> str:
    return (
        f"Python {platform.python_version()} "
        f"({platform.system()} {platform.machine()})"
    )


if __name__ == "__main__":
    commands = {
        "add": lambda: add(),
        "printname": lambda: (
            printname(sys.argv[2]) if len(sys.argv) > 2 else "Missing name argument"
        ),
        "info": lambda: info(),
    }

    command = sys.argv[1] if len(sys.argv) > 1 else None

    if command in commands:
        print(commands[command]())
    else:
        print("No command provided" if command is None else f"Unknown command: {command}")
        sys.exit(1)
