Set-Location "C:\Users\USUARIO\Documents\Opita Sync\opita-sync-repo\opita-sync"
$env:VITE_OPITA_DATA_SOURCE = "remote"
$env:VITE_OPITA_API_BASE_URL = "http://localhost:4000"
$env:VITE_OPITA_AUTH_STORAGE_KEY = "opita-sync.gemini-local-real.session"
$env:VITE_OPITA_ENABLE_STUB_FALLBACK = "false"
npm.cmd run dev -- --host 127.0.0.1 --port 5173
