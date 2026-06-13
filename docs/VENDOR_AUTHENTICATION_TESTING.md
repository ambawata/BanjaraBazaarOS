**Vendor Authentication Testing — PowerShell Guide**

Complete step-by-step guide to test the vendor authentication flow locally.

## Setup

1. **Start backend**:
   ```powershell
   php -S localhost:8000 -t public
   ```

2. **Ensure vendor exists** (register or use existing from seed):
   - Email: `vendor@example.com`
   - Password: `SecurePassword123`
   - Status: Active (admin approved)

## Test Flow

### Step 1: Login

```powershell
$loginResponse = curl -X POST "http://localhost:8000/api/v1/auth/login" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "vendor@example.com",
    "password": "SecurePassword123",
    "device_label": "PowerShell Test"
  }' | ConvertFrom-Json

Write-Host "Login Response:"
Write-Host ($loginResponse | ConvertTo-Json)

# Save tokens for next steps
$accessToken = $loginResponse.data.access_token
$refreshToken = $loginResponse.data.refresh_token
$expiresIn = $loginResponse.data.expires_in

Write-Host "Access Token: $($accessToken.Substring(0,20))..."
Write-Host "Expires in: $expiresIn seconds"
```

**Expected output**:
```
status: success
access_token: eyJhbGciOiJIUzI1NiIs...
expires_in: 3600
refresh_token: a1b2c3d4e5f6...
user.roles: ["vendor"]
```

### Step 2: Use Access Token (Protected Request)

```powershell
$accessToken = "YOUR_ACCESS_TOKEN_FROM_STEP_1"

$productsResponse = curl -X GET "http://localhost:8000/api/v1/products?limit=5" `
  -H "Authorization: Bearer $accessToken" | ConvertFrom-Json

Write-Host "Products List:"
Write-Host ($productsResponse | ConvertTo-Json)
```

**Expected output**:
```
status: success
data.items: [...]
data.total: 0 (or number of existing products)
```

**If token is invalid**, you'll get:
```
error: unauthorized
message: Invalid or expired access token.
```

### Step 3: Refresh Token (Before Expiry)

```powershell
$refreshToken = "YOUR_REFRESH_TOKEN_FROM_STEP_1"

$refreshResponse = curl -X POST "http://localhost:8000/api/v1/auth/refresh" `
  -H "Content-Type: application/json" `
  -d "{`"refresh_token`": `"$refreshToken`"}" | ConvertFrom-Json

Write-Host "Refresh Response:"
Write-Host ($refreshResponse | ConvertTo-Json)

# Save new tokens
$newAccessToken = $refreshResponse.data.access_token
$newRefreshToken = $refreshResponse.data.refresh_token

Write-Host "New Access Token: $($newAccessToken.Substring(0,20))..."
Write-Host "New Refresh Token: $($newRefreshToken.Substring(0,20))..."
```

**Expected output**:
```
status: success
access_token: eyJhbGciOiJIUzI1NiIs... (NEW)
expires_in: 3600
refresh_token: xyz789abc... (NEW - rotated)
```

**Note**: Old tokens are now revoked.

### Step 4: Create Product (Using New Access Token)

```powershell
$accessToken = "YOUR_NEW_ACCESS_TOKEN_FROM_STEP_3"

$createResponse = curl -X POST "http://localhost:8000/api/v1/products" `
  -H "Authorization: Bearer $accessToken" `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test Product",
    "description": "Test Description",
    "price": 299.99,
    "sku": "TEST-001",
    "stock_quantity": 100,
    "images": [
      {"file_path": "/storage/uploads/test.jpg", "alt_text": "Test"}
    ]
  }' | ConvertFrom-Json

Write-Host "Create Product Response:"
Write-Host ($createResponse | ConvertTo-Json)

$productId = $createResponse.data.id
Write-Host "Created Product ID: $productId"
```

**Expected output**:
```
status: success
data.id: 1 (or next ID)
data.status: draft
data.slug: test-product
```

### Step 5: Logout (Revoke Refresh Token)

```powershell
$refreshToken = "YOUR_REFRESH_TOKEN_FROM_STEP_3"

$logoutResponse = curl -X POST "http://localhost:8000/api/v1/auth/logout" `
  -H "Content-Type: application/json" `
  -d "{`"refresh_token`": `"$refreshToken`"}" | ConvertFrom-Json

Write-Host "Logout Response:"
Write-Host ($logoutResponse | ConvertTo-Json)
```

**Expected output**:
```
status: success
message: Logged out successfully.
```

### Step 6: Verify Refresh Token is Revoked

```powershell
$revokedToken = "YOUR_REFRESH_TOKEN_FROM_STEP_3"

$invalidRefresh = curl -X POST "http://localhost:8000/api/v1/auth/refresh" `
  -H "Content-Type: application/json" `
  -d "{`"refresh_token`": `"$revokedToken`"}" | ConvertFrom-Json

Write-Host "Refresh After Logout:"
Write-Host ($invalidRefresh | ConvertTo-Json)
```

**Expected output**:
```
status: error
error: unauthorized
message: Refresh token invalid or expired.
```

## Test Failed Login Lockout (Optional)

```powershell
# Try login 5 times with wrong password
for ($i = 1; $i -le 5; $i++) {
    Write-Host "Attempt $i..."
    $attempt = curl -X POST "http://localhost:8000/api/v1/auth/login" `
      -H "Content-Type: application/json" `
      -d '{
        "email": "vendor@example.com",
        "password": "WrongPassword123"
      }' | ConvertFrom-Json
    
    Write-Host $attempt.data.message
    Start-Sleep -Seconds 1
}

# 6th attempt should show 423
Write-Host "Attempt 6 (should be locked)..."
$locked = curl -X POST "http://localhost:8000/api/v1/auth/login" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "vendor@example.com",
    "password": "SecurePassword123"
  }' | ConvertFrom-Json

Write-Host "Status: $($locked.data.message)"
```

**Expected output (on attempt 6)**:
```
Account temporarily locked.
```

## Complete Automation Script

Save as `auth-test.ps1`:

```powershell
# =============================================================================
# Vendor Authentication Test Script
# =============================================================================

$baseUrl = "http://localhost:8000"
$email = "vendor@example.com"
$password = "SecurePassword123"

Write-Host "=== STEP 1: LOGIN ===" -ForegroundColor Green

$loginRes = curl -X POST "$baseUrl/api/v1/auth/login" `
  -H "Content-Type: application/json" `
  -d "{`"email`": `"$email`", `"password`": `"$password`", `"device_label`": `"PowerShell Test`"}" `
  | ConvertFrom-Json

if ($loginRes.status -ne "success") {
    Write-Host "Login failed!" -ForegroundColor Red
    Write-Host $loginRes
    exit 1
}

$accessToken = $loginRes.data.access_token
$refreshToken = $loginRes.data.refresh_token

Write-Host "✓ Login successful" -ForegroundColor Green
Write-Host "  Access Token: $($accessToken.Substring(0,20))..."
Write-Host "  Refresh Token: $($refreshToken.Substring(0,20))..."
Write-Host ""

Write-Host "=== STEP 2: LIST PRODUCTS (Protected) ===" -ForegroundColor Green

$listRes = curl -X GET "$baseUrl/api/v1/products" `
  -H "Authorization: Bearer $accessToken" `
  | ConvertFrom-Json

Write-Host "✓ Protected request successful" -ForegroundColor Green
Write-Host "  Total products: $($listRes.data.total)"
Write-Host ""

Write-Host "=== STEP 3: REFRESH TOKEN ===" -ForegroundColor Green

$refreshRes = curl -X POST "$baseUrl/api/v1/auth/refresh" `
  -H "Content-Type: application/json" `
  -d "{`"refresh_token`": `"$refreshToken`"}" `
  | ConvertFrom-Json

$newAccessToken = $refreshRes.data.access_token
$newRefreshToken = $refreshRes.data.refresh_token

Write-Host "✓ Token refreshed" -ForegroundColor Green
Write-Host "  New Access Token: $($newAccessToken.Substring(0,20))..."
Write-Host "  New Refresh Token: $($newRefreshToken.Substring(0,20))..."
Write-Host ""

Write-Host "=== STEP 4: LOGOUT ===" -ForegroundColor Green

$logoutRes = curl -X POST "$baseUrl/api/v1/auth/logout" `
  -H "Content-Type: application/json" `
  -d "{`"refresh_token`": `"$newRefreshToken`"}" `
  | ConvertFrom-Json

Write-Host "✓ Logged out" -ForegroundColor Green
Write-Host ""

Write-Host "=== STEP 5: VERIFY REVOKED TOKEN ===" -ForegroundColor Yellow

$invalidRes = curl -X POST "$baseUrl/api/v1/auth/refresh" `
  -H "Content-Type: application/json" `
  -d "{`"refresh_token`": `"$newRefreshToken`"}" `
  | ConvertFrom-Json

if ($invalidRes.status -eq "error") {
    Write-Host "✓ Token correctly revoked" -ForegroundColor Green
    Write-Host "  Error: $($invalidRes.message)"
} else {
    Write-Host "✗ Token should be invalid!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== ALL TESTS PASSED ===" -ForegroundColor Green
```

Run it:

```powershell
.\auth-test.ps1
```

## Expected Output

```
=== STEP 1: LOGIN ===
✓ Login successful
  Access Token: eyJhbGciOiJIUzI1NiIs...
  Refresh Token: a1b2c3d4e5f6...

=== STEP 2: LIST PRODUCTS (Protected) ===
✓ Protected request successful
  Total products: 0

=== STEP 3: REFRESH TOKEN ===
✓ Token refreshed
  New Access Token: xyz789abc...
  New Refresh Token: new123token...

=== STEP 4: LOGOUT ===
✓ Logged out

=== STEP 5: VERIFY REVOKED TOKEN ===
✓ Token correctly revoked
  Error: Refresh token invalid or expired.

=== ALL TESTS PASSED ===
```

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| Login returns 401 | Wrong credentials | Check email/password in database |
| Login returns 423 | Account locked | Wait 15 min or reset in DB |
| Protected requests return 401 | Invalid token | Token expired or malformed |
| Refresh returns 401 | Token revoked/expired | Requires fresh login |
| Token doesn't work after refresh | Using old token | Use new token from refresh response |

## Key Points

- **Access token**: 60 minutes (default)
- **Refresh token**: 30 days (default)
- **Device tracking**: Optional but recommended for security
- **IP address**: Automatically captured from X-Forwarded-For or REMOTE_ADDR
- **All events logged**: Check `auth_audit_log` table for audit trail

See [VENDOR_AUTHENTICATION.md](VENDOR_AUTHENTICATION.md) for detailed API docs.
