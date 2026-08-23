use std::{
    io::Write,
    path::PathBuf,
    process::{Command, Stdio},
};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

/// Resolve the bundled Python interpreter and app script.
///
/// Production layouts:
/// - Windows / Linux: resources sit next to the executable
/// - macOS: resources sit under `Contents/Resources/`
///
/// Dev (`cargo tauri dev`): platform runtimes may be copied under `target/debug`,
/// but `python-app` often is not — we walk ancestors to find `src-tauri/`.
fn resolve_python_command() -> (PathBuf, PathBuf) {
    let exe_path = std::env::current_exe().expect("failed to get exe path");

    #[cfg(target_os = "macos")]
    let exe_dir = {
        // MacOS/<bin> → Contents (Resources is a sibling of MacOS)
        exe_path
            .parent()
            .and_then(|p| p.parent())
            .map(|p| p.to_path_buf())
            .unwrap_or_else(|| exe_path.parent().unwrap().to_path_buf())
    };

    #[cfg(not(target_os = "macos"))]
    let exe_dir = exe_path
        .parent()
        .expect("failed to get exe parent dir")
        .to_path_buf();

    let python_script = {
        #[cfg(target_os = "macos")]
        let bundled = exe_dir.join("Resources/python-app/app/main.py");

        #[cfg(not(target_os = "macos"))]
        let bundled = exe_dir.join("python-app/app/main.py");

        if bundled.exists() {
            bundled
        } else {
            exe_dir
                .ancestors()
                .find_map(|dir| {
                    let candidate = dir.join("src-tauri/python-app/app/main.py");
                    if candidate.exists() {
                        Some(candidate)
                    } else {
                        None
                    }
                })
                .unwrap_or(bundled)
        }
    };

    #[cfg(target_os = "windows")]
    let python_exe = {
        let bundled = exe_dir.join("python-windows/python.exe");
        if bundled.exists() {
            bundled
        } else {
            exe_dir
                .ancestors()
                .find_map(|dir| {
                    let p = dir.join("src-tauri/python-windows/python.exe");
                    if p.exists() {
                        Some(p)
                    } else {
                        None
                    }
                })
                .unwrap_or(bundled)
        }
    };

    #[cfg(target_os = "macos")]
    let python_exe = {
        let bundled = exe_dir.join("Resources/python-macos/bin/python3");
        if bundled.exists() {
            bundled
        } else {
            exe_dir
                .ancestors()
                .find_map(|dir| {
                    let p = dir.join("src-tauri/python-macos/bin/python3");
                    if p.exists() {
                        Some(p)
                    } else {
                        None
                    }
                })
                .unwrap_or_else(|| exe_dir.join("python-macos/bin/python3"))
        }
    };

    #[cfg(target_os = "linux")]
    let python_exe = {
        let bundled = exe_dir.join("python-linux/bin/python3");
        if bundled.exists() {
            bundled
        } else {
            exe_dir
                .ancestors()
                .find_map(|dir| {
                    let p = dir.join("src-tauri/python-linux/bin/python3");
                    if p.exists() {
                        Some(p)
                    } else {
                        None
                    }
                })
                .unwrap_or_else(|| {
                    // Last resort: system Python (dev machines without a fetched runtime)
                    PathBuf::from("python3")
                })
        }
    };

    (python_exe, python_script)
}

fn create_hidden_command(program: &PathBuf) -> Command {
    let cmd = Command::new(program);

    #[cfg(target_os = "windows")]
    {
        let mut cmd = cmd;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
        return cmd;
    }

    #[cfg(not(target_os = "windows"))]
    cmd
}

/// Run `python main.py <cmd> [args...]` and return stdout (or a clear error).
fn run_python(cmd: &str, args: &[&str]) -> Result<String, String> {
    let (python, script) = resolve_python_command();

    if python.as_os_str() != "python3" && !python.exists() {
        return Err(format!(
            "Bundled Python not found at: {}\nRun the setup script for your OS (see README).",
            python.display()
        ));
    }

    if !script.exists() {
        return Err(format!("Python app script not found at: {}", script.display()));
    }

    let output = create_hidden_command(&python)
        .arg(&script)
        .arg(cmd)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .stdin(Stdio::null())
        .output()
        .map_err(|e| format!("Failed to start Python ({}): {}", python.display(), e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        let mut msg = format!("Python exited with {}", output.status);
        if !stderr.trim().is_empty() {
            msg.push_str("\nstderr: ");
            msg.push_str(stderr.trim());
        }
        if !stdout.trim().is_empty() {
            msg.push_str("\nstdout: ");
            msg.push_str(stdout.trim());
        }
        let _ = writeln!(std::io::stderr(), "[python] {}", msg);
        return Err(msg);
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim_end().to_string())
}

#[tauri::command]
fn add() -> Result<String, String> {
    run_python("add", &[])
}

#[tauri::command]
fn add_name(name: String) -> Result<String, String> {
    run_python("printname", &[&name])
}

#[tauri::command]
fn python_info() -> Result<String, String> {
    run_python("info", &[])
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add, add_name, python_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
