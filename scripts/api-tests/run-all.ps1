param(
  [string]$BaseUrl = "http://127.0.0.1:8000"
)

$ErrorActionPreference = "Stop"

$tests = @(
  "01-vendor-registration.ps1",
  "02-login.ps1",
  "03-product-crud.ps1",
  "04-approval-flow.ps1",
  "05-protected-routes.ps1"
)

foreach ($test in $tests) {
  Write-Host ""
  Write-Host "=== Running $test ==="
  & "$PSScriptRoot\$test" -BaseUrl $BaseUrl
}

Write-Host ""
Write-Host "All MVP API tests passed."
