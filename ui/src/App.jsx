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
