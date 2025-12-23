# Tauri + Python + React Integration

A desktop application demonstrating Python backend integration with Tauri + React frontend. This example shows two types of Python functions: a simple calculation function and a function that accepts user input.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (UI)                     │
│              Button clicks & user input forms               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    Tauri invoke() API
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Rust Backend (Tauri)                     │
│              Tauri commands bridge to Python                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                  std::process::Command
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   Python Functions (Logic)                  │
│          Command dispatcher executes specific function      │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 How It Works

### Example 1: Simple Function (No Arguments)

**Flow: Add Function**

1. **React**: User clicks "Call Add Function" button

   ```javascript
   const pythonResult = await invoke("add");
   ```

2. **Rust**: `add()` command receives the call

   ```rust
   #[tauri::command]
   fn add() -> String {
       // Runs: python main.py add
   }
   ```

3. **Python**: Command dispatcher routes to `add()` function

   ```python
   def add():
       return "Addition: 5 + 3 = 8"
   ```

4. **Result**: String flows back → Rust → React → Display

---

### Example 2: Function with Arguments

**Flow: PrintName Function**

1. **React**: User enters name "Alice" and clicks button

   ```javascript
   const pythonResult = await invoke("add_name", { name: "Alice" });
   ```

2. **Rust**: `add_name(name)` command receives the string

   ```rust
   #[tauri::command]
   fn add_name(name: String) -> String {
       // Runs: python main.py printname Alice
   }
   ```

3. **Python**: Command dispatcher passes argument to function

   ```python
   def printname(name: str):
       return "Name: " + name
   ```

4. **Result**: "Name: Alice" flows back → Rust → React → Display

## 📁 Project Structure

```
.
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs           # Tauri commands (add, add_name)
│   │   └── main.rs          # Entry point
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri config + Python bundling
├── python/
│   └── app/
│       └── main.py          # Python functions + command dispatcher
└── ui/
    └── src/
        └── App.jsx          # React UI with buttons and input
```

## 💻 Code Walkthrough

### 1. Python Backend (`main.py`)

```python
def add():
    return "Addition: 5 + 3 = 8"

def printname(name: str):
    return "Name: " + name

# Command dispatcher at bottom of file
if __name__ == "__main__":
    commands = {
        "add": lambda: add(),
        "printname": lambda: printname(sys.argv[2]) if len(sys.argv) > 2 else "Missing name"
    }

    command = sys.argv[1] if len(sys.argv) > 1 else None
    if command in commands:
        print(commands[command]())
```

**Key Points:**

- Each function is simple and focused
- Command dispatcher maps string commands to functions
- Arguments come from `sys.argv[2]`, `sys.argv[3]`, etc.
- Function output is printed to stdout

---

### 2. Rust Bridge (`lib.rs`)

```rust
#[tauri::command]
fn add() -> String {
    let exe_dir: PathBuf = std::env::current_exe()
        .expect("failed to get exe path")
        .parent()
        .unwrap()
        .to_path_buf();

    let python_exe = exe_dir.join("python/python.exe");
    let python_script = exe_dir.join("python/app/main.py");

    let output = Command::new(python_exe)
        .arg(python_script)
        .arg("add")              // Command name
        .output()
        .expect("failed to execute python");

    String::from_utf8_lossy(&output.stdout).to_string()
}

#[tauri::command]
fn add_name(name: String) -> String {
    // ... same setup ...

    let output = Command::new(python_exe)
        .arg(python_script)
        .arg("printname")        // Command name
        .arg(name)               // Argument
        .output()
        .expect("failed to execute python");

    String::from_utf8_lossy(&output.stdout).to_string()
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add, add_name])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Key Points:**

- Each Rust function is a `#[tauri::command]`
- Locates bundled Python executable relative to app
- Executes Python with command name and optional arguments
- Returns stdout as string to frontend
- All commands registered in `invoke_handler`

---

### 3. React Frontend (`App.jsx`)

```javascript
function App() {
  const [result, setResult] = useState("");
  const [name, setName] = useState("");

  async function callAdd() {
    const pythonResult = await invoke("add"); // No arguments
    setResult(pythonResult);
  }

  async function callPrintName() {
    const pythonResult = await invoke("add_name", { name: name }); // With argument
    setResult(pythonResult);
  }

  return (
    <div>
      <button onClick={callAdd}>Call Add Function</button>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <button onClick={callPrintName}>Call PrintName Function</button>

      <div>{result}</div>
    </div>
  );
}
```

**Key Points:**

- `invoke('command_name')` calls Rust commands
- Arguments passed as object: `{ name: name }`
- Results displayed in UI
- Loading states prevent multiple simultaneous calls

## 🎯 Adding Your Own Function

### Step 1: Add Python Function

```python
# In main.py
def multiply(a, b):
    return f"Multiplication: {a} × {b} = {float(a) * float(b)}"
```

### Step 2: Register in Command Dispatcher

```python
# In main.py command dispatcher
commands = {
    "add": lambda: add(),
    "printname": lambda: printname(sys.argv[2]) if len(sys.argv) > 2 else "Missing name",
    "multiply": lambda: multiply(sys.argv[2], sys.argv[3]) if len(sys.argv) > 3 else "Missing args"
}
```

### Step 3: Create Rust Command

```rust
// In lib.rs
#[tauri::command]
fn multiply_numbers(num1: String, num2: String) -> String {
    let exe_dir: PathBuf = std::env::current_exe()
        .expect("failed to get exe path")
        .parent()
        .unwrap()
        .to_path_buf();

    let python_exe = exe_dir.join("python/python.exe");
    let python_script = exe_dir.join("python/app/main.py");

    let output = Command::new(python_exe)
        .arg(python_script)
        .arg("multiply")
        .arg(num1)
        .arg(num2)
        .output()
        .expect("failed to execute python");

    String::from_utf8_lossy(&output.stdout).to_string()
}

// Register it
.invoke_handler(tauri::generate_handler![add, add_name, multiply_numbers])
```

### Step 4: Call from React

```javascript
async function callMultiply() {
  const result = await invoke("multiply_numbers", {
    num1: "6",
    num2: "7",
  });
  setResult(result);
}
```

## ⚙️ Setup & Installation

### Prerequisites

- Cargo & Tauri CLI
- Node.js & npm
- Rust (latest stable)
- Python 3.8+

### Development Setup

```bash
# Install frontend dependencies
cd ui
npm install

# Run development mode
cd ..
cargo tauri dev
```

## Embedded Python Setup (Already Done in Template)

This template ships with:

- Official **Python embeddable distribution**
- `pip` installed locally (already included in this template and if not included, follow the steps below) :

#### If have to set up manually, follow these steps to install pip:

```powershell
src-tauri\python\python.exe src-tauri\python\get-pip.py
```

_Download `get-pip.py` from [https://bootstrap.pypa.io/get-pip.py](https://bootstrap.pypa.io/get-pip.py) and place it in `src-tauri/python/`_.

#### Verify pip installation:

```powershell
src-tauri\python\python.exe -m pip --version
```

#### Verify installed packages:

```powershell
src-tauri\python\python.exe -m pip list
```

- All packages stored inside `src-tauri/python`

### Install additional Python packages

```powershell
src-tauri\python\python.exe -m pip install <package-name>
```

Examples:

```powershell
src-tauri\python\python.exe -m pip install requests numpy
```

To verify installed packages (Show the list of all the installed packages):

```powershell
src-tauri\python\python.exe -m pip list
```

All dependencies remain **self‑contained**.

---

### Building for Production

```bash
cargo tauri build
```

The build bundles:

- Compiled Rust code
- React frontend
- Python runtime from `python/` folder
- Creates platform-specific installer

## 🔧 Configuration

### Bundle Python (`tauri.conf.json`)

```json
{
  "bundle": {
    "resources": ["python"]
  }
}
```

This includes the entire `python/` folder in the final executable.

### Python Path Resolution

The app finds Python relative to the executable location:

```rust
let exe_dir = std::env::current_exe().parent().to_path_buf();
let python_exe = exe_dir.join("python/python.exe");
```

This makes the app portable - no system Python required.

## 🎯 Real-World Use Cases

### Machine Learning

```python
def predict(data):
    model = load_model('model.pkl')
    return model.predict(data)
```

### Data Processing

```python
def analyze_csv(filepath):
    df = pd.read_csv(filepath)
    return df.describe().to_json()
```

### API Calls

```python
def fetch_weather(city):
    response = requests.get(f"api.weather.com/{city}")
    return response.json()
```

### Image Processing

```python
def resize_image(path, width, height):
    img = Image.open(path)
    img = img.resize((width, height))
    return "Image resized successfully"
```

## 🐛 Troubleshooting

| Issue                | Solution                                                              |
| -------------------- | --------------------------------------------------------------------- |
| Python not found     | Ensure `python/` is in `src-tauri/` and `tauri.conf.json` includes it |
| Module import errors | Bundle required packages in `python/Lib/site-packages/`               |
| Permission errors    | On macOS/Linux, make Python executable: `chmod +x python/python`      |
| Command not found    | Check command name matches in Python dispatcher and Rust function     |

## 📝 Why This Pattern?

**Advantages:**

- ✅ Simple, predictable data flow
- ✅ Each component has one responsibility
- ✅ Easy to add new functions
- ✅ Leverage Python's ecosystem (NumPy, pandas, ML libraries)
- ✅ Native desktop performance
- ✅ Cross-platform (Windows, macOS, Linux)

**Best For:**

- Wrapping Python scripts in desktop UI
- Data science applications
- Machine learning inference
- File processing automation
- API integration tools

## 📚 Resources

- [Tauri Documentation](https://tauri.app)

## 📄 License

MIT License

---

**Built with**: Tauri 2.x | React 18 | Rust | Python 3.x  
**Made by**: [Nitiksh](https://www.nitiksh.ntxm.org)
