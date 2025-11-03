# 🚀 Tauri + React + Vite Starter (v2)

A modern desktop application boilerplate using **Tauri v2**, **React**, and **Vite**.  
Fast, secure, and lightweight — perfect for building production-ready cross-platform apps.

---

## 🧰 Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 18.x
- **Rust & Cargo** → [Install Rust](https://rustup.rs)
- **Tauri CLI (v2)**

  ```bash
  cargo install tauri-cli --version "^2.0.0"
  ```

- (Windows only) **Visual Studio Build Tools** or **MSVC**
- (Linux) `libgtk-3-dev` and `libwebkit2gtk-4.1-dev`
- (macOS) Xcode Command Line Tools

---

## ⚙️ Create a New Project

### 1️⃣ Create React + Vite frontend

```bash
npm create vite@latest ui -- --template react
cd ui
npm install
```

Test the frontend (optional):

```bash
npm run dev
```

You should see Vite’s default page at [http://localhost:5173](http://localhost:5173).

---

### 2️⃣ Initialize Tauri backend

From your **root project folder**:

```bash
cd ..
cargo tauri init
```

Answer prompts like this 👇

```
✔ What is your app name? · MyApp
✔ Where is your frontend code? · ../ui/dist
✔ What is the url of your dev server? · http://localhost:5173
✔ What is your frontend dev command? · npm run dev
✔ What is your build command? · npm run build
```

This creates the backend folder:

```
src-tauri/
```

---

### 3️⃣ Install Tauri frontend API package

In your React app folder:

```bash
cd ui
npm install @tauri-apps/api
```

---

## 📁 Project Structure

```
project-root/
├─ src-tauri/          # Rust backend
│  ├─ src/
│  │  ├─ lib.rs        # Tauri logic + commands
│  │  └─ main.rs
│  └─ tauri.conf.json  # App configuration
└─ ui/                 # React + Vite frontend
   ├─ src/
   │  ├─ App.jsx
   │  └─ main.jsx
   ├─ index.html
   └─ package.json
```

---

## 🦀 Example: Calling Rust from React

### `src-tauri/src/lib.rs`

```rust
#[tauri::command]
fn get_user() -> String {
    println!("User command called");
    "User command executed!".into()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_user])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### `ui/src/App.jsx`

```jsx
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [msg, setMsg] = useState("Nothing yet");

  async function handleClick() {
    const res = await invoke("get_user");
    setMsg(res);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Tauri + React + Vite</h1>
      <button onClick={handleClick}>Call Rust</button>
      <p>{msg}</p>
    </div>
  );
}

export default App;
```

---

## 🧑‍💻 Development

From the **root directory**:

```bash
cargo tauri dev
```

This will:

- Run your React Vite dev server (`npm run dev`)
- Run the Tauri backend
- Open the app window connected to your live frontend

---

## 🏗️ Building for Production

```bash
cargo tauri build
```

This will:

- Build your React app (`npm run build`)
- Package everything into a native `.exe`, `.app`, or `.deb` installer (depending on OS)
- Output is found in:

  ```
  src-tauri/target/release/bundle/
  ```

---

## ⚡ Common Commands

| Task                 | Command                |
| -------------------- | ---------------------- |
| Run dev mode         | `cargo tauri dev`      |
| Build production app | `cargo tauri build`    |
| Clean project        | `cargo clean`          |
| Run only frontend    | `cd ui && npm run dev` |

---

## 🧩 Useful Tips

- You can call any Rust function from JS using:

  ```js
  invoke("command_name", { argName: value });
  ```

- Want multiple pages? Use **React Router** for SPA-style routing.
- Want multiple native windows? Use `WindowBuilder` in Rust.

---

## 🧠 Resources

- 📘 [Tauri v2 Docs](https://v2.tauri.app)
- ⚛️ [React Docs](https://react.dev)
- ⚡ [Vite Docs](https://vitejs.dev)
- 🦀 [Rust Language](https://www.rust-lang.org/)

---

## 🏁 License

MIT © 2025 [nitiksh](https://nitiksh.ntxm.org/)
