**Vendor Registration — Beginner Testing Guide**

Purpose
- **Goal**: Teach a beginner how to test the vendor registration API endpoint step-by-step.

Prerequisites
- **Local server**: Run the API (for example via PHP built-in server or your usual local setup).
- **Database**: Ensure the database is migrated and seeded (see [database/schema.sql](database/schema.sql)).
- **Settings**: The feature flag `feature.vendor_signup_open` must be enabled in the `settings` table (see [backend/services/SettingsService.php](backend/services/SettingsService.php)).
- **Route**: The endpoint is exposed at `/api/v1/vendors/register` (see [backend/api/v1/routes.php](backend/api/v1/routes.php)).

Endpoint overview
- **Method**: POST
- **URL**: Replace `BASE_URL` with your environment base URL, e.g. `http://localhost:8000`.
  - Full path: `BASE_URL/api/v1/vendors/register`
- **Auth**: Public (no authentication required)
- **Success status**: `201 Created` on success

Request body — JSON fields
- **Required**:
  - `email` : string — valid email address
  - `full_name` : string
  - `phone` : string — 10–20 characters
  - `password` : string — minimum length configured by `auth.password_min_length` (default 10)
- **Conditionally required (based on settings)**:
  - `business_name` : string — required if `vendor.business_name_required` is true
  - `gst_number` : string — required and validated if `vendor.gst_required` is true
- **Optional / additional**:
  - `pan_number`, `business_type`, `business_category`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country` (defaults to India), `website`, `contact_name`, `contact_email`, `contact_phone`, `business_metadata` (object)

Minimal working example payload

```json
{
  "email": "alice@example.com",
  "full_name": "Alice Merchant",
  "phone": "9876543210",
  "password": "verysecurepassword",
  "business_name": "Alice Stores"
}
```

curl example

```bash
curl -X POST "http://localhost:8000/api/v1/vendors/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "full_name": "Alice Merchant",
    "phone": "9876543210",
    "password": "verysecurepassword",
    "business_name": "Alice Stores"
  }'
```

Sample successful response (201)

```json
{
  "status": "success",
  "data": {
    "id": 123,
    "user_id": 45,
    "slug": "vendor-...",
    "status": "pending",
    "created_at": "2026-05-17 12:34:56",
    "updated_at": "2026-05-17 12:34:56",
    "user": {
      "email": "alice@example.com",
      "full_name": "Alice Merchant"
    },
    "profile": {
      "business_name": "Alice Stores",
      "gst_number": null,
      "pan_number": null,
      "business_type": null,
      "business_category": null,
      "city": null,
      "state": null,
      "country": "India"
    }
  }
}
```

Validation error example (422)

```json
{
  "status": "error",
  "error": "validation_failed",
  "message": "One or more fields are invalid.",
  "meta": {
    "errors": {
      "email": "A valid email address is required.",
      "password": "Password must be at least 10 characters."
    }
  }
}
```

Common failure cases
- **Feature closed (403)**: If `feature.vendor_signup_open` is false you will see an error: `Vendor registration is not currently open.`
- **Email already registered (409)**: The service will return a 409 with message `Email address is already registered.`
- **Invalid GST/PAN**: Format checks are enforced for GSTIN (15-char pattern) and PAN (10-char pattern).
- **Server error (500)**: If DB or other errors happen, check server logs at `storage/logs/`.

Testing checklist
- **Smoke**: Send minimal payload, expect `201` and `status: success`.
- **Validation**: Remove or invalidate fields (email, password, phone) and expect `422` with helpful messages.
- **Duplicate email**: Re-submit the same email and expect `409`.
- **Settings**: Toggle `feature.vendor_signup_open` and verify `403` when disabled.
- **Edge**: Send `business_metadata` JSON object and confirm it's saved and returned.

Using Postman
- Create a new POST request to `{{BASE_URL}}/api/v1/vendors/register`.
- Set `Content-Type: application/json` and paste the example JSON in the body (raw).
- Save request to a collection to re-run and tweak fields easily.

Automated tests (suggestion)
- Write an integration test that:
  - Ensures settings enable vendor signup.
  - Posts valid payload and asserts `201` and returned `data.id` exists.
  - Posts invalid payload and asserts `422` with specific field errors.
- Use your preferred PHP testing setup (PHPUnit) with a test database.

Where to look in code
- **Routes**: [backend/api/v1/routes.php](backend/api/v1/routes.php)
- **Registration logic & validation**: [backend/services/VendorRegistrationService.php](backend/services/VendorRegistrationService.php)
- **Settings source**: [backend/services/SettingsService.php](backend/services/SettingsService.php)
- **Response helpers**: [backend/helpers/JsonResponse.php](backend/helpers/JsonResponse.php)

Next steps
- If you want, I can add a Postman collection JSON for quick import or create a PHPUnit integration test example.
