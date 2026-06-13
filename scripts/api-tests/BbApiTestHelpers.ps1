param(
  [string]$BaseUrl = "http://127.0.0.1:8000"
)

Set-StrictMode -Version Latest
$script:BaseUrl = $BaseUrl.TrimEnd("/")
$script:ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")

function Join-BbApiUrl {
  param([string]$Path)
  if ($Path.StartsWith("http")) {
    return $Path
  }
  return "$($script:BaseUrl)/$($Path.TrimStart('/'))"
}

function Invoke-BbApi {
  param(
    [ValidateSet("GET", "POST", "PATCH", "DELETE")]
    [string]$Method,
    [string]$Path,
    [object]$Body = $null,
    [string]$Token = $null,
    [int[]]$Expected = @(200)
  )

  $headers = @{}
  if ($Token) {
    $headers["Authorization"] = "Bearer $Token"
  }

  $uri = Join-BbApiUrl $Path
  $content = ""
  $statusCode = 0

  try {
    if ($null -ne $Body) {
      $json = $Body | ConvertTo-Json -Depth 12
      $response = Invoke-WebRequest -Uri $uri -Method $Method -Headers $headers -ContentType "application/json" -Body $json -UseBasicParsing
    } else {
      $response = Invoke-WebRequest -Uri $uri -Method $Method -Headers $headers -UseBasicParsing
    }
    $statusCode = [int]$response.StatusCode
    $content = $response.Content
  } catch {
    if ($_.Exception.Response) {
      $statusCode = [int]$_.Exception.Response.StatusCode
      $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
      $content = $reader.ReadToEnd()
    } elseif ($_.ErrorDetails.Message) {
      $content = $_.ErrorDetails.Message
      throw "Request failed before HTTP response: $content"
    } else {
      throw
    }
  }

  if ($Expected -notcontains $statusCode) {
    throw "Expected HTTP $($Expected -join ',') for $Method $Path but got ${statusCode}: $content"
  }

  if ($content -eq "") {
    return $null
  }
  return $content | ConvertFrom-Json
}

function Assert-BbEqual {
  param(
    [object]$Actual,
    [object]$Expected,
    [string]$Label
  )
  if ($Actual -ne $Expected) {
    throw "$Label expected '$Expected' but got '$Actual'"
  }
  Write-Host "PASS $Label"
}

function Assert-BbNotEmpty {
  param(
    [object]$Value,
    [string]$Label
  )
  if ($null -eq $Value -or [string]$Value -eq "") {
    throw "$Label was empty"
  }
  Write-Host "PASS $Label"
}

function Test-BbServer {
  Invoke-BbApi -Method GET -Path "/api/v1/health" -Expected @(200, 503) | Out-Null
  Write-Host "PASS API server reachable at $script:BaseUrl"
}

function New-BbTestSuffix {
  return Get-Date -Format "yyyyMMddHHmmssfff"
}

function New-BbVendorFixture {
  $suffix = New-BbTestSuffix
  $email = "mvpvendor$suffix@example.com"
  $phone = "9" + (Get-Date -Format "HHmmssfff")
  $password = "SecurePassword123"

  return [pscustomobject]@{
    Email = $email
    Password = $password
    Phone = $phone
    Payload = @{
      email = $email
      phone = $phone
      full_name = "MVP Test Vendor"
      password = $password
      business_name = "MVP Test Store $suffix"
      gst_number = "27ABCDE1234F1Z5"
      pan_number = "ABCDE1234F"
      business_type = "sole_proprietorship"
      business_category = "handicrafts"
      city = "Jaipur"
      state = "Rajasthan"
      contact_email = $email
      contact_phone = $phone
    }
  }
}

function Register-BbVendor {
  param([object]$Fixture)
  return Invoke-BbApi -Method POST -Path "/api/v1/vendors/register" -Body $Fixture.Payload -Expected @(201)
}

function Login-BbUser {
  param(
    [string]$Email,
    [string]$Password,
    [string]$DeviceLabel = "PowerShell API Test"
  )
  return Invoke-BbApi -Method POST -Path "/api/v1/auth/login" -Body @{
    email = $Email
    password = $Password
    device_label = $DeviceLabel
  } -Expected @(200)
}

function Ensure-BbTestAdmin {
  param(
    [string]$Email = "mvp-admin@example.com",
    [string]$Password = "AdminPassword123"
  )

  $env:BB_TEST_ADMIN_EMAIL = $Email
  $env:BB_TEST_ADMIN_PASSWORD = $Password

  $php = @'
require 'backend/core/bootstrap.php';
$pdo = Backend\Core\Database::connection();
$email = getenv('BB_TEST_ADMIN_EMAIL') ?: 'mvp-admin@example.com';
$password = getenv('BB_TEST_ADMIN_PASSWORD') ?: 'AdminPassword123';
$hash = Backend\Helpers\PasswordHelper::hash($password);
$stmt = $pdo->prepare(
    'INSERT INTO users (email, phone, full_name, password_hash, status, created_at, updated_at)
     VALUES (:email, NULL, :name, :hash, :status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash),
       status = VALUES(status), deleted_at = NULL, updated_at = CURRENT_TIMESTAMP'
);
$stmt->execute([
    'email' => $email,
    'name' => 'MVP Test Admin',
    'hash' => $hash,
    'status' => 'active',
]);
$userId = (int) $pdo->query('SELECT id FROM users WHERE email = ' . $pdo->quote($email))->fetchColumn();
$roleId = (int) $pdo->query('SELECT id FROM roles WHERE slug = ' . $pdo->quote('admin'))->fetchColumn();
if ($roleId <= 0) {
    throw new RuntimeException('Admin role missing. Run php scripts/migrate.php first.');
}
$stmt = $pdo->prepare('INSERT IGNORE INTO user_roles (user_id, role_id, assigned_by, assigned_at) VALUES (:user_id, :role_id, NULL, CURRENT_TIMESTAMP)');
$stmt->execute(['user_id' => $userId, 'role_id' => $roleId]);
echo $email;
'@

  Push-Location $script:ProjectRoot
  try {
    $createdEmail = & php -r $php
  } finally {
    Pop-Location
  }

  Write-Host "PASS test admin ready: $createdEmail"
  return [pscustomobject]@{
    Email = $Email
    Password = $Password
  }
}

function Approve-BbVendor {
  param(
    [int]$VendorId,
    [string]$AdminToken
  )
  return Invoke-BbApi -Method POST -Path "/api/v1/vendors/$VendorId/approve" -Token $AdminToken -Body @{
    notes = "Approved by PowerShell API test"
  } -Expected @(200)
}

function New-BbProductPayload {
  $suffix = New-BbTestSuffix
  return @{
    name = "MVP Test Product $suffix"
    description = "Created by PowerShell API test"
    price = 299.99
    sku = "MVP-$suffix"
    currency = "INR"
    stock_quantity = 12
    tags = @("handmade", "mvp")
    metadata = @{
      material = "cotton"
      test_run = $suffix
    }
    images = @(
      @{
        file_path = "/storage/uploads/products/mvp-test.jpg"
        alt_text = "MVP test image"
      }
    )
  }
}
