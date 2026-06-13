param(
  [string]$BaseUrl = "http://127.0.0.1:8000"
)

. "$PSScriptRoot\BbApiTestHelpers.ps1" -BaseUrl $BaseUrl

Test-BbServer

$vendor = New-BbVendorFixture
$response = Register-BbVendor $vendor

Assert-BbEqual $response.status "success" "vendor registration response"
Assert-BbNotEmpty $response.data.id "vendor id"
Assert-BbEqual $response.data.status "pending" "new vendor status"
Assert-BbEqual $response.data.user.email $vendor.Email "registered vendor email"

Write-Host "Vendor email: $($vendor.Email)"
Write-Host "Vendor password: $($vendor.Password)"
