param(
  [string]$BaseUrl = "http://127.0.0.1:8000"
)

. "$PSScriptRoot\BbApiTestHelpers.ps1" -BaseUrl $BaseUrl

Test-BbServer

$admin = Ensure-BbTestAdmin
$adminLogin = Login-BbUser -Email $admin.Email -Password $admin.Password -DeviceLabel "PowerShell Protected Routes Admin"
$adminToken = $adminLogin.data.access_token

$unauthenticatedProducts = Invoke-BbApi -Method GET -Path "/api/v1/products" -Expected @(401)
Assert-BbEqual $unauthenticatedProducts.error "unauthorized" "unauthenticated product route denied"

$vendor = New-BbVendorFixture
$registration = Register-BbVendor $vendor
$vendorId = [int]$registration.data.id

$vendorLogin = Login-BbUser -Email $vendor.Email -Password $vendor.Password -DeviceLabel "PowerShell Protected Routes Vendor"
$vendorToken = $vendorLogin.data.access_token

$pendingCreate = Invoke-BbApi -Method POST -Path "/api/v1/products" -Token $vendorToken -Body (New-BbProductPayload) -Expected @(403)
Assert-BbEqual $pendingCreate.error "forbidden" "pending vendor has no product access"

$approvedVendor = Approve-BbVendor -VendorId $vendorId -AdminToken $adminToken
Assert-BbEqual $approvedVendor.data.status "active" "vendor approved for protected product routes"

$created = Invoke-BbApi -Method POST -Path "/api/v1/products" -Token $vendorToken -Body (New-BbProductPayload) -Expected @(201)
$productId = [int]$created.data.id
Assert-BbEqual $created.data.status "draft" "approved vendor can create product"

$submitted = Invoke-BbApi -Method POST -Path "/api/v1/products/$productId/submit" -Token $vendorToken -Body @{} -Expected @(200)
Assert-BbEqual $submitted.data.status "pending" "approved vendor can submit product"

$vendorProductApproval = Invoke-BbApi -Method POST -Path "/api/v1/products/$productId/approve" -Token $vendorToken -Body @{
  notes = "Vendor should not be allowed"
} -Expected @(403)
Assert-BbEqual $vendorProductApproval.error "forbidden" "vendor cannot approve product"

$adminProductApproval = Invoke-BbApi -Method POST -Path "/api/v1/products/$productId/approve" -Token $adminToken -Body @{
  notes = "Admin approval from protected route test"
} -Expected @(200)
Assert-BbEqual $adminProductApproval.data.status "approved" "admin can approve product"

Write-Host "Protected route checks completed for vendor $vendorId and product $productId"
