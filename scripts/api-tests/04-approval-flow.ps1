param(
  [string]$BaseUrl = "http://127.0.0.1:8000"
)

. "$PSScriptRoot\BbApiTestHelpers.ps1" -BaseUrl $BaseUrl

Test-BbServer

$admin = Ensure-BbTestAdmin
$adminLogin = Login-BbUser -Email $admin.Email -Password $admin.Password -DeviceLabel "PowerShell Approval Admin"
$adminToken = $adminLogin.data.access_token

$vendor = New-BbVendorFixture
$registration = Register-BbVendor $vendor
$vendorId = [int]$registration.data.id

$vendorLogin = Login-BbUser -Email $vendor.Email -Password $vendor.Password -DeviceLabel "PowerShell Approval Vendor"
$vendorToken = $vendorLogin.data.access_token

$approvedVendor = Approve-BbVendor -VendorId $vendorId -AdminToken $adminToken
Assert-BbEqual $approvedVendor.data.status "active" "admin approve vendor"
Assert-BbNotEmpty $approvedVendor.data.approved_at "vendor approval timestamp"

$created = Invoke-BbApi -Method POST -Path "/api/v1/products" -Token $vendorToken -Body (New-BbProductPayload) -Expected @(201)
$productId = [int]$created.data.id

$submitted = Invoke-BbApi -Method POST -Path "/api/v1/products/$productId/submit" -Token $vendorToken -Body @{} -Expected @(200)
Assert-BbEqual $submitted.data.status "pending" "product pending before review"

$pending = Invoke-BbApi -Method GET -Path "/api/v1/products/admin/pending?limit=10" -Token $adminToken -Expected @(200)
if ([int]$pending.data.total -lt 1) {
  throw "Expected pending product in admin queue"
}
Write-Host "PASS admin pending product queue"

$rejected = Invoke-BbApi -Method POST -Path "/api/v1/products/$productId/reject" -Token $adminToken -Body @{
  reason = "Needs better product copy"
} -Expected @(200)
Assert-BbEqual $rejected.data.status "rejected" "admin reject product"
Assert-BbNotEmpty $rejected.data.rejected_at "product rejection timestamp"
Assert-BbEqual $rejected.data.rejection_reason "Needs better product copy" "product rejection reason"

$resubmitted = Invoke-BbApi -Method POST -Path "/api/v1/products/$productId/submit" -Token $vendorToken -Body @{} -Expected @(200)
Assert-BbEqual $resubmitted.data.status "pending" "rejected product resubmitted"

$approved = Invoke-BbApi -Method POST -Path "/api/v1/products/$productId/approve" -Token $adminToken -Body @{
  notes = "Approved by PowerShell approval test"
} -Expected @(200)
Assert-BbEqual $approved.data.status "approved" "admin approve product"
Assert-BbNotEmpty $approved.data.approved_at "product approval timestamp"

Write-Host "Approval flow completed for vendor $vendorId and product $productId"
