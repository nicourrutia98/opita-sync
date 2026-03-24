$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$envFile = Join-Path $repoRoot ".env.gemini-local-real"
$composeFile = Join-Path $repoRoot "docker-compose.gemini-local-real.yml"

Get-Content $envFile | ForEach-Object {
  if ($_ -match "^\s*#") { return }
  if ($_ -match "^\s*$") { return }
  $parts = $_ -split "=", 2
  [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1], "Process")
}

Write-Host "Starting Opita Gemini Local Real with database $env:DATABASE_URL"
docker compose -f $composeFile up -d postgres

Set-Location $repoRoot
npm run db:migrate
npm run db:seed
npm run backend:provision:admin
npm run backend:dev
