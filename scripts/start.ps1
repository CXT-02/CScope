[CmdletBinding()]
param(
    [switch]$NoBrowser,
    [switch]$CheckOnly
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$backendRoot = Join-Path $projectRoot 'backend'
$frontendRoot = Join-Path $projectRoot 'frontend'
$runtimeRoot = Join-Path $projectRoot '.runtime'
$pidFile = Join-Path $runtimeRoot 'processes.json'
$pythonPath = Join-Path $backendRoot '.venv\Scripts\python.exe'
$vitePath = Join-Path $frontendRoot 'node_modules\vite\bin\vite.js'

function Resolve-NodePath {
    $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($nodeCommand) {
        return $nodeCommand.Source
    }

    $knownNode = Join-Path $env:LOCALAPPDATA 'Doubao\User Data\sandbox_runtime\bases\772984f6fd3a8ae0ae7d2422cd7c2bfa\node\node.exe'
    if (Test-Path -LiteralPath $knownNode) {
        return $knownNode
    }

    $doubaoBases = Join-Path $env:LOCALAPPDATA 'Doubao\User Data\sandbox_runtime\bases'
    if (Test-Path -LiteralPath $doubaoBases) {
        $candidate = Get-ChildItem -LiteralPath $doubaoBases -Filter node.exe -File -Recurse -ErrorAction SilentlyContinue |
            Select-Object -First 1
        if ($candidate) {
            return $candidate.FullName
        }
    }

    throw 'Node.js was not found. Install Node.js or restore the Doubao runtime.'
}

function Test-LocalPort {
    param([int]$Port)
    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $task = $client.ConnectAsync('127.0.0.1', $Port)
        if (-not $task.Wait(350)) {
            return $false
        }
        return $client.Connected
    }
    catch {
        return $false
    }
    finally {
        $client.Dispose()
    }
}

function Wait-ForUrl {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 20
    )
    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    while ([DateTime]::UtcNow -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return $true
            }
        }
        catch {
            Start-Sleep -Milliseconds 350
        }
    }
    return $false
}

function Test-UrlContent {
    param(
        [string]$Url,
        [string]$ExpectedText
    )
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
        return $response.Content -like "*$ExpectedText*"
    }
    catch {
        return $false
    }
}

function New-ProcessRecord {
    param(
        [System.Diagnostics.Process]$Process,
        [string]$Name
    )
    return [pscustomobject]@{
        name = $Name
        pid = $Process.Id
        startedAtUtcTicks = $Process.StartTime.ToUniversalTime().Ticks
    }
}

if (-not (Test-Path -LiteralPath $pythonPath)) {
    throw "Backend virtual environment was not found: $pythonPath"
}
if (-not (Test-Path -LiteralPath $vitePath)) {
    throw "Frontend dependencies were not found: $vitePath. Install dependencies in frontend first."
}

$nodePath = Resolve-NodePath
Write-Host 'CScope environment check passed.' -ForegroundColor Green
Write-Host "Python: $pythonPath"
Write-Host "Node:   $nodePath"

if ($CheckOnly) {
    Write-Host 'Check-only mode: no services were started.' -ForegroundColor Cyan
    exit 0
}

New-Item -ItemType Directory -Path $runtimeRoot -Force | Out-Null
$records = @()

if (Test-Path -LiteralPath $pidFile) {
    try {
        $parsedRecords = Get-Content -LiteralPath $pidFile -Raw -Encoding UTF8 | ConvertFrom-Json
        $savedRecords = @($parsedRecords | ForEach-Object { $_ })
        foreach ($record in $savedRecords) {
            $existing = Get-Process -Id $record.pid -ErrorAction SilentlyContinue
            if ($existing) {
                $records += $record
            }
        }
    }
    catch {
        $records = @()
    }
}

if (Test-LocalPort -Port 8000) {
    if (-not (Test-UrlContent -Url 'http://127.0.0.1:8000/api/v1/health' -ExpectedText 'cscope-backend')) {
        throw 'Port 8000 is occupied by another application. Close it and retry.'
    }
    Write-Host 'Backend is already running on port 8000.' -ForegroundColor Yellow
}
else {
    $backendProcess = Start-Process -FilePath $pythonPath `
        -ArgumentList @('-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000') `
        -WorkingDirectory $backendRoot `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $runtimeRoot 'backend.out.log') `
        -RedirectStandardError (Join-Path $runtimeRoot 'backend.err.log') `
        -PassThru
    $records += New-ProcessRecord -Process $backendProcess -Name 'backend'
    Write-Host "Backend started (PID $($backendProcess.Id))."
}

if (Test-LocalPort -Port 5173) {
    if (-not (Test-UrlContent -Url 'http://127.0.0.1:5173/' -ExpectedText 'CScope')) {
        throw 'Port 5173 is occupied by another application. Close it and retry.'
    }
    Write-Host 'Frontend is already running on port 5173.' -ForegroundColor Yellow
}
else {
    $frontendProcess = Start-Process -FilePath $nodePath `
        -ArgumentList @($vitePath, '--host', '127.0.0.1', '--port', '5173', '--strictPort') `
        -WorkingDirectory $frontendRoot `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $runtimeRoot 'frontend.out.log') `
        -RedirectStandardError (Join-Path $runtimeRoot 'frontend.err.log') `
        -PassThru
    $records += New-ProcessRecord -Process $frontendProcess -Name 'frontend'
    Write-Host "Frontend started (PID $($frontendProcess.Id))."
}

ConvertTo-Json -InputObject @($records) | Set-Content -LiteralPath $pidFile -Encoding UTF8

$frontendReady = Wait-ForUrl -Url 'http://127.0.0.1:5173/' -TimeoutSeconds 20
if (-not $frontendReady) {
    throw "Frontend startup timed out. Check logs in: $runtimeRoot"
}

$backendReady = Wait-ForUrl -Url 'http://127.0.0.1:8000/api/v1/health' -TimeoutSeconds 8
if ($backendReady) {
    Write-Host 'Backend online: real Transformer weights are enabled.' -ForegroundColor Green
}
else {
    Write-Host 'Backend is not ready. The site will use local simulated data.' -ForegroundColor Yellow
}

$siteUrl = 'http://127.0.0.1:5173/'
Write-Host "CScope is ready: $siteUrl" -ForegroundColor Cyan
Write-Host 'To stop CScope, double-click the stop launcher in the project root.'

if (-not $NoBrowser) {
    Start-Process $siteUrl
}
