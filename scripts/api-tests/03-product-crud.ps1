param(
  [string]$BaseUrl = "http://127.0.0.1:8000"
)

. "$PSScriptRoot\BbApiTestHelpers.ps1" -BaseUrl $BaseUrl

Test-BbServer

$admin = Ensure-BbTestAdmin
$adminLogin = Login-BbUser -Email $admin.Email -Password $admin.Password -DeviceLabel "PowerShell Product CRUD Admin"
$adminToken = $adminLogin.data.access_token

$vendor = New-BbVendorFixture
$registration = Register-BbVendor $vendor
$vendorId = [int]$registration.data.id

$vendorLogin = Login-BbUser -Email $vendor.Email -Password $vendor.Password -DeviceLabel "PowerShell Product CRUD Vendor"
$vendorToken = $vendorLogin.data.access_token

$blocked = Invoke-BbApi -Method POST -Path "/api/v1/products" -Token $vendorToken -Body (New-BbProductPayload) -Expected @(403)
Assert-BbEqual $blocked.error "forbidden" "pending vendor product create denied"

$approvedVendor = Approve-BbVendor -VendorId $vendorId -AdminToken $adminToken
Assert-BbEqual $approvedVendor.data.status "active" "vendor approval status"

$productPayload = New-BbProductPayload
$created = Invoke-BbApi -Method POST -Path "/api/v1/products" -Token $vendorToken -Body $productPayload -Expected @(201)
Assert-BbEqual $created.status "success" "product create response"
Assert-BbEqual $created.data.status "draft" "created product status"
$productId = [int]$created.data.id

$list = Invoke-BbApi -Method GET -Path "/api/v1/products?limit=10" -Token $vendorToken -Expected @(200)
if ([int]$list.data.total -lt 1) {
  throw "Expected at least one product in vendor list"
}
Write-Host "PASS vendor product list"

$updated = Invoke-BbApi -Method PATCH -Path "/api/v1/products/$productId" -Token $vendorToken -Body @{
  description = "Updated by PowerShell product CRUD test"
  price = 349.50
  stock_quantity = 15
} -Expected @(200)
Assert-BbEqual $updated.data.name $productPayload.name "product update preserves name"
Assert-BbEqual $updated.data.description "Updated by PowerShell product CRUD test" "product update description"
Assert-BbEqual $updated.data.price 349.5 "product update price"
Assert-BbEqual $updated.data.stock_quantity 15 "product update stock"

$submitted = Invoke-BbApi -Method POST -Path "/api/v1/products/$productId/submit" -Token $vendorToken -Body @{} -Expected @(200)
Assert-BbEqual $submitted.data.status "pending" "product submit status"

Write-Host "Product CRUD flow completed for product $productId"
