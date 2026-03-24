$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$envFile = Join-Path $repoRoot ".env.gemini-local-real"

Get-Content $envFile | ForEach-Object {
  if ($_ -match "^\s*#") { return }
  if ($_ -match "^\s*$") { return }
  $parts = $_ -split "=", 2
  [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1], "Process")
}

Write-Host "Running Opita Gemini backend in dev mode on port $env:PORT using $env:DATABASE_URL"
Set-Location $repoRoot
npm run backend:dev
