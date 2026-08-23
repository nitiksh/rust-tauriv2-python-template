# Fetch a clean Windows embeddable CPython into src-tauri/python-windows
# Does NOT install pip or app packages — see python-windows/README.md
#
# Usage (from repo root):
#   powershell -ExecutionPolicy Bypass -File scripts/setup-python-windows.ps1

param(
    [string]$PythonVersion = "3.12.6"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Dest = Join-Path $Root "src-tauri\python-windows"
$ZipName = "python-$PythonVersion-embed-amd64.zip"
$Url = "https://www.python.org/ftp/python/$PythonVersion/$ZipName"
$Tmp = Join-Path $env:TEMP $ZipName

Write-Host "==> Downloading $Url"
Invoke-WebRequest -Uri $Url -OutFile $Tmp

if (Test-Path $Dest) {
    Write-Host "==> Removing existing $Dest"
    Remove-Item $Dest -Recurse -Force
}
New-Item -ItemType Directory -Path $Dest | Out-Null

Write-Host "==> Extracting to $Dest"
Expand-Archive -Path $Tmp -DestinationPath $Dest -Force
Remove-Item $Tmp -Force

$Pth = Get-ChildItem $Dest -Filter "python*._pth" | Select-Object -First 1
if (-not $Pth) { throw "python*._pth not found" }
$ZipFile = Get-ChildItem $Dest -Filter "python*.zip" | Select-Object -First 1
if (-not $ZipFile) { throw "python*.zip not found" }

@(
    $ZipFile.Name,
    ".",
    "Lib",
    "Scripts",
    "import site"
) | Set-Content -Path $Pth.FullName -Encoding ascii

New-Item -ItemType Directory -Force -Path (Join-Path $Dest "Lib\site-packages") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Dest "Scripts") | Out-Null
@(
    "This site-packages folder is intentionally empty."
    "Install packages with pip after setup - see README.md."
) | Set-Content (Join-Path $Dest "Lib\site-packages\README.txt") -Encoding utf8

Write-Host "==> Downloading get-pip.py (not executed)"
Invoke-WebRequest -Uri "https://bootstrap.pypa.io/get-pip.py" -OutFile (Join-Path $Dest "get-pip.py")

$Readme = Join-Path $PSScriptRoot "runtime-readmes\windows.md"
if (Test-Path $Readme) {
    Copy-Item $Readme (Join-Path $Dest "README.md") -Force
}

Write-Host ""
Write-Host "Clean Windows Python ready at: $Dest"
Write-Host "Next: follow python-windows/README.md (install pip, then packages)."
& (Join-Path $Dest "python.exe") -c "import sys; print(sys.version)"
