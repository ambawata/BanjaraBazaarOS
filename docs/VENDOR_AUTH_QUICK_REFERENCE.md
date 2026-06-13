**Quick Reference: Vendor Auth Commands (PowerShell)**

Copy-paste ready commands for testing vendor authentication locally.

## Prerequisites

- Backend running: `php -S localhost:8000 -t public`
- Vendor account created and approved
- Example: `vendor@example.com` / `SecurePassword123`

## Command Cheat Sheet

### 1. Login

```powershell
curl -X POST "http://localhost:8000/api/v1/auth/login" `
  -H "Content-Type: application/json" `
  -d '{"email":"vendor@example.com","password":"SecurePassword123","device_label":"My Device"}' `
  | ConvertFrom-Json
```

**Save these from response**:
- `.data.access_token` → use for API calls
- `.data.refresh_token` → use to get new access token

### 2. List Products (Protected)

```powershell
$token = "YOUR_ACCESS_TOKEN"

curl "http://localhost:8000/api/v1/products" `
  -H "Authorization: Bearer $token" `
  | ConvertFrom-Json
```

### 3. Refresh Token

```powershell
$refreshToken = "YOUR_REFRESH_TOKEN"

curl -X POST "http://localhost:8000/api/v1/auth/refresh" `
  -H "Content-Type: application/json" `
  -d "{`"refresh_token`":
`"$refreshToken`"}" `
  | ConvertFrom-Json
```

**Save new tokens from response** (old ones are revoked).

### 4. Create Product

```powershell
$token = "YOUR_ACCESS_TOKEN"

curl -X POST "http://localhost:8000/api/v1/products" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{
    "name":"Test Product",
    "price":299.99,
    "stock_quantity":50,
    "images":[{"file_path":"/storage/uploads/product.jpg"}]
  }' `
  | ConvertFrom-Json
```

### 5. Logout

```powershell
$refreshToken = "YOUR_REFRESH_TOKEN"

curl -X POST "http://localhost:8000/api/v1/auth/logout" `
  -H "Content-Type: application/json" `
  -d "{`"refresh_token`":`"$refreshToken`"}" `
  | ConvertFrom-Json
```

## Store Tokens as Variables (Recommended)

```powershell
# Login and save tokens
$auth = curl -X POST "http://localhost:8000/api/v1/auth/login" `
  -H "Content-Type: application/json" `
  -d '{"email":"vendor@example.com","password":"SecurePassword123"}' `
  | ConvertFrom-Json

$accessToken = $auth.data.access_token
$refreshToken = $auth.data.refresh_token

# Use token in subsequent calls
curl "http://localhost:8000/api/v1/products" `
  -H "Authorization: Bearer $accessToken"
```

## Key Status Codes

| Code | Meaning |
|------|---------|
| 200 | Request succeeded |
| 201 | Resource created |
| 401 | Invalid/expired token or credentials |
| 403 | Insufficient permissions |
| 422 | Validation error |
| 423 | Account temporarily locked |

## Security Notes

1. **Never hardcode tokens** in scripts you share
2. **Use environment variables** for credentials in production:
   ```powershell
   $email = $env:VENDOR_EMAIL
   $password = $env:VENDOR_PASSWORD
   ```
3. **Refresh before expiry** (60-minute default TTL)
4. **Logout when done** to revoke refresh token

## Docs & Help

- Full API docs: [VENDOR_AUTHENTICATION.md](VENDOR_AUTHENTICATION.md)
- Testing guide: [VENDOR_AUTHENTICATION_TESTING.md](VENDOR_AUTHENTICATION_TESTING.md)
- Product API: [PRODUCT_UPLOAD_API.md](PRODUCT_UPLOAD_API.md)
