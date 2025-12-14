import sys


def add():
    return "Addition: 5 + 3 = 8"


def printname(name: str):
    return "Name: " + name


if __name__ == "__main__":
    commands = {
        "add": lambda: add(),
        "printname": lambda: (
            printname(sys.argv[2]) if len(sys.argv) > 2 else "Missing name argument"
        ),
    }

    command = sys.argv[1] if len(sys.argv) > 1 else None

    if command in commands:
        print(commands[command]())
    else:
        print("No command provided" if command is None else "Unknown command")
