param(
  [string]$BaseUrl = "http://127.0.0.1:8000"
)

. "$PSScriptRoot\BbApiTestHelpers.ps1" -BaseUrl $BaseUrl

Test-BbServer

$vendor = New-BbVendorFixture
$registration = Register-BbVendor $vendor
$vendorId = [int]$registration.data.id

$login = Login-BbUser -Email $vendor.Email -Password $vendor.Password -DeviceLabel "PowerShell Login Test"
Assert-BbEqual $login.status "success" "login response"
Assert-BbNotEmpty $login.data.access_token "access token"
Assert-BbNotEmpty $login.data.refresh_token "refresh token"
Assert-BbEqual $login.data.user.email $vendor.Email "login user email"

$me = Invoke-BbApi -Method GET -Path "/api/v1/vendors/me" -Token $login.data.access_token -Expected @(200)
Assert-BbEqual $me.data.id $vendorId "authenticated vendor profile"

$refresh = Invoke-BbApi -Method POST -Path "/api/v1/auth/refresh" -Body @{
  refresh_token = $login.data.refresh_token
  device_label = "PowerShell Refresh Test"
} -Expected @(200)
Assert-BbNotEmpty $refresh.data.access_token "refreshed access token"
Assert-BbNotEmpty $refresh.data.refresh_token "rotated refresh token"

$logout = Invoke-BbApi -Method POST -Path "/api/v1/auth/logout" -Body @{
  refresh_token = $refresh.data.refresh_token
} -Expected @(200)
Assert-BbEqual $logout.status "success" "logout response"

Write-Host "Login/refresh/logout completed for $($vendor.Email)"
