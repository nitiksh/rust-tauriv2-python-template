use std::path::PathBuf;
use std::process::Command;

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
        .arg("add")
        .output()
        .expect("failed to execute python");

    String::from_utf8_lossy(&output.stdout).to_string()
}

#[tauri::command]
fn add_name(name: String) -> String {
    let exe_dir: PathBuf = std::env::current_exe()
        .expect("failed to get exe path")
        .parent()
        .unwrap()
        .to_path_buf();

    let python_exe = exe_dir.join("python/python.exe");
    let python_script = exe_dir.join("python/app/main.py");

    let output = Command::new(python_exe)
        .arg(python_script)
        .arg("printname")
        .arg(name)
        .output()
        .expect("failed to execute python");

    String::from_utf8_lossy(&output.stdout).to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add, add_name])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
