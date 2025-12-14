import sys
import json


def main():
    # Get input from command line arguments
    if len(sys.argv) > 2:
        try:
            num1 = float(sys.argv[1])
            num2 = float(sys.argv[2])
            result = num1 + num2
            data = {
                "num1": num1,
                "num2": num2,
                "result": result,
                "operation": "addition",
                "status": "success",
            }
        except ValueError:
            data = {"status": "error", "message": "Invalid numbers provided"}
    else:
        data = {"status": "error", "message": "Please provide two numbers"}

    print(json.dumps(data))


if __name__ == "__main__":
    main()
