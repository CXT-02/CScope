[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$runtimeRoot = Join-Path $projectRoot '.runtime'
$pidFile = Join-Path $runtimeRoot 'processes.json'

if (-not (Test-Path -LiteralPath $pidFile)) {
    Write-Host 'No process record created by the CScope launcher was found.' -ForegroundColor Yellow
    exit 0
}

$parsedRecords = Get-Content -LiteralPath $pidFile -Raw -Encoding UTF8 | ConvertFrom-Json
$records = @($parsedRecords | ForEach-Object { $_ })
$stopped = 0

foreach ($record in $records) {
    $process = Get-Process -Id $record.pid -ErrorAction SilentlyContinue
    if (-not $process) {
        continue
    }

    try {
        if ($record.startedAtUtcTicks) {
            $savedStartTicks = [long]$record.startedAtUtcTicks
        }
        else {
            $parsedStart = [DateTimeOffset]::Parse(
                [string]$record.startedAt,
                [System.Globalization.CultureInfo]::InvariantCulture,
                [System.Globalization.DateTimeStyles]::RoundtripKind
            )
            $savedStartTicks = $parsedStart.UtcDateTime.Ticks
        }
    }
    catch {
        Write-Host "Skipped PID $($record.pid): invalid start-time record." -ForegroundColor Yellow
        continue
    }

    $actualStartTicks = $process.StartTime.ToUniversalTime().Ticks
    if ([Math]::Abs($actualStartTicks - $savedStartTicks) -gt [TimeSpan]::TicksPerSecond * 2) {
        Write-Host "Skipped PID $($record.pid): the PID has been reused by another process." -ForegroundColor Yellow
        continue
    }

    Stop-Process -Id $process.Id -Force
    Write-Host "Stopped $($record.name) (PID $($process.Id))."
    $stopped += 1
}

Remove-Item -LiteralPath $pidFile -Force
Write-Host "CScope stopped. Closed $stopped process(es)." -ForegroundColor Green
