**Vendor Authentication API — Production Documentation**

The vendor authentication system is built-in and production-ready. This guide covers how vendors authenticate and access protected resources.

## Architecture Overview

- **JWT (JSON Web Tokens)**: Short-lived access tokens (default 60 min)
- **Refresh Tokens**: Long-lived refresh tokens (default 30 days), hashed in DB
- **Account Lockout**: Automatic after N failed attempts (default 5)
- **Audit Trail**: All auth events logged (login success/failure, refresh, logout)
- **Role-Based**: Middleware enforces role permissions (vendor, admin, etc.)

## Authentication Flow

```
1. Vendor calls POST /api/v1/auth/login
   ├─ Validates email/phone + password
   ├─ Checks account status & lockout
   └─ Returns access_token + refresh_token

2. Vendor uses access_token in Bearer header for API requests
   ├─ AuthMiddleware validates JWT signature
   └─ Request proceeds if valid

3. When access_token expires
   ├─ Vendor calls POST /api/v1/auth/refresh
   ├─ Validates refresh_token from DB
   └─ Issues new access_token (refresh_token rotated)

4. On logout
   ├─ Vendor calls POST /api/v1/auth/logout
   └─ Refresh token revoked in DB
```

## API Endpoints

### 1. Login

**POST** `/api/v1/auth/login`

**Request body**:

```json
{
  "email": "vendor@example.com",
  "password": "SecurePassword123",
  "device_label": "iPhone Safari (optional)"
}
```

**Response (200)**:

```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600,
    "refresh_token": "a1b2c3d4e5f6...",
    "user": {
      "id": 45,
      "email": "vendor@example.com",
      "name": "Alice Merchant",
      "roles": ["vendor"]
    }
  }
}
```

**Errors**:
- `401` : Invalid credentials
- `423` : Account temporarily locked (too many failed attempts)
- `403` : Account not active

### 2. Refresh Token

**POST** `/api/v1/auth/refresh`

**Request body**:

```json
{
  "refresh_token": "a1b2c3d4e5f6...",
  "device_label": "iPhone Safari (optional)"
}
```

**Response (200)**:

```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600,
    "refresh_token": "new_token_xyz..."
  }
}
```

**Notes**:
- Refresh token is rotated on each use
- Old token is automatically revoked
- Validates token against hash in DB (never stored plaintext)

### 3. Logout

**POST** `/api/v1/auth/logout`

**Request body**:

```json
{
  "refresh_token": "a1b2c3d4e5f6..."
}
```

**Response (200)**:

```json
{
  "status": "success",
  "data": {
    "message": "Logged out successfully."
  }
}
```

**Notes**:
- Revokes refresh token in DB
- Vendor must discard access_token on client
- Future refresh attempts will fail

## Using Access Token

All protected endpoints require the access token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example**:

```bash
curl http://localhost:8000/api/v1/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Token Structure (JWT Claims)

Access token payload includes:

```json
{
  "iss": "banjarabazaar-os",
  "sub": "45",
  "email": "vendor@example.com",
  "roles": ["vendor"],
  "permissions": ["products.create", "products.read"],
  "iat": 1715949000,
  "nbf": 1715949000,
  "exp": 1715952600
}
```

- `sub` : User ID
- `roles` : Array of role slugs
- `permissions` : Array of permission slugs
- `exp` : Expiration timestamp (UTC)

## Security Features

### 1. Password Hashing
- Algorithm: Bcrypt (PHP `password_hash`)
- Automatic rehashing on login if algorithm changes

### 2. Failed Login Lockout
- Increments on each failed attempt
- Locks account after N attempts (default 5)
- Locked for M minutes (default 15)
- Resets on successful login

### 3. Refresh Token Storage
- Token: Random 64 hex chars (256 bits)
- Stored as: SHA256 hash (never stored plaintext)
- Verification: Hash incoming token and compare

### 4. Account Status Checks
- Validates user status = 'active'
- Rejects suspended/deleted accounts
- Checked on login and token refresh

### 5. IP & Device Tracking
- Stores IP address (X-Forwarded-For header)
- Stores device label (client-provided)
- Stored in sessions table for audit

### 6. Audit Logging
Events logged:
- `auth.login.success` — Successful login
- `auth.login.failure` — Wrong password
- `auth.login.locked` — Account temporarily locked
- `auth.login.denied` — Account not active
- `auth.refresh.success` — Token refresh OK
- `auth.refresh.failure` — Invalid/expired refresh token
- `auth.logout.success` — Logout event

Each log includes: user_id, IP address, user-agent, timestamp, metadata.

## Configuration (Settings Table)

| Key | Type | Default | Purpose |
|---|---|---|---|
| `auth.password_min_length` | int | 10 | Minimum password length |
| `auth.jwt_access_ttl_min` | int | 60 | Access token TTL (minutes) |
| `auth.jwt_refresh_ttl_days` | int | 30 | Refresh token TTL (days) |
| `auth.max_failed_attempts` | int | 5 | Failed attempts before lockout |
| `auth.lockout_minutes` | int | 15 | Account lockout duration (minutes) |

Modify in DB:

```sql
UPDATE `settings` SET `value` = '20' WHERE `key` = 'auth.password_min_length';
```

## Middleware & Auth Guards

### AuthMiddleware

Validates bearer token and extracts claims.

**Usage in routes**:

```php
$r->post('/api/v1/products', $handler, [new AuthMiddleware(require: true)]);
```

- `require: true` — Token is mandatory
- `require: false` — Token optional (available if present)

### RoleMiddleware

Checks if user has at least one allowed role.

**Usage in routes**:

```php
$r->post('/api/v1/products', $handler, [
    new AuthMiddleware(require: true),
    new RoleMiddleware(['vendor'])
]);
```

Allows only users with role = 'vendor'.

## Example Testing: Vendor Login

### 1. Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "password": "SecurePassword123",
    "device_label": "Test Device"
  }'
```

**Save the returned `access_token` and `refresh_token`.**

### 2. Use Access Token

```bash
curl http://localhost:8000/api/v1/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Refresh Token (when access expires)

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
```

**Save the new `access_token` from response.**

### 4. Logout

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
```

After logout, refresh token is invalid.

## Account Lockout & Unlock

### Simulate Lockout

Try login with wrong password 5 times:

```bash
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"vendor@example.com","password":"WrongPassword"}'
done
```

Next login attempt returns `423` with "Account temporarily locked."

### Unlock (Admin)

```sql
UPDATE `users` SET `failed_login_attempts` = 0, `locked_until` = NULL WHERE `id` = <vendor_user_id>;
```

Or wait 15 minutes.

## Source Code

- **AuthService**: [backend/services/AuthService.php](backend/services/AuthService.php)
  - Login, refresh, logout, token validation
  - Password verification and hashing
  - Token generation and management

- **AuthMiddleware**: [backend/middleware/AuthMiddleware.php](backend/middleware/AuthMiddleware.php)
  - Bearer token extraction and validation
  - Claims extraction

- **RoleMiddleware**: [backend/middleware/RoleMiddleware.php](backend/middleware/RoleMiddleware.php)
  - Role permission checking

- **PasswordHelper**: [backend/helpers/PasswordHelper.php](backend/helpers/PasswordHelper.php)
  - Bcrypt hashing and verification

- **Routes**: [backend/api/v1/routes.php](backend/api/v1/routes.php)
  - `/api/v1/auth/login`
  - `/api/v1/auth/refresh`
  - `/api/v1/auth/logout`

## Best Practices for Vendors

1. **Store tokens securely** on client (HttpOnly cookies or secure storage)
2. **Refresh proactively** before expiry (60-minute window)
3. **Handle 401 responses** by redirecting to login
4. **Use device_label** to track which device/browser is using the token
5. **Log out on app exit** to revoke refresh token
6. **Never expose tokens** in URLs or logs

## Testing Complete Auth Flow

1. Create vendor account via `/api/v1/vendors/register`
2. Admin approves vendor
3. Vendor logs in via `/api/v1/auth/login`
4. Create product via `POST /api/v1/products` with access token
5. Refresh token before expiry
6. List products
7. Logout

See [VENDOR_REGISTRATION_TESTING.md](VENDOR_REGISTRATION_TESTING.md) for vendor onboarding setup.
