**Vendor Product Upload API — Production Documentation**

This document describes the Phase 2 vendor product catalog API. All endpoints are production-ready and follow BanjaraBazaarOS architecture patterns.

## Architecture Overview

- **Database**: 3 new tables (`products`, `product_images`, `product_audit_log`)
- **Services**: `ProductService` (business logic), `ProductAuditService` (audit trail)
- **Routes**: 7 REST endpoints with role-based access control
- **Status workflow**: `draft` → `pending` → `approved` | `rejected`
- **Audit**: All product events logged with user, IP, user-agent, metadata

## Database Schema

### Products Table

```sql
CREATE TABLE `products` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  vendor_id BIGINT UNSIGNED (FK vendors),
  sku VARCHAR(100) NULL,
  slug VARCHAR(100) UNIQUE per vendor,
  name VARCHAR(255),
  description LONGTEXT,
  price DECIMAL(12,2),
  currency VARCHAR(10) DEFAULT 'INR',
  status ENUM('draft','pending','approved','rejected'),
  rejection_reason VARCHAR(255),
  approved_at TIMESTAMP NULL,
  rejected_at TIMESTAMP NULL,
  tags JSON,
  metadata JSON,
  stock_quantity INT UNSIGNED,
  stock_reserved INT UNSIGNED,
  created_at / updated_at / deleted_at
);
```

### Product Images Table

```sql
CREATE TABLE `product_images` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT UNSIGNED (FK products),
  file_path VARCHAR(255),
  alt_text VARCHAR(255),
  display_order TINYINT UNSIGNED,
  is_primary TINYINT(1)
);
```

### Product Audit Log Table

```sql
CREATE TABLE `product_audit_log` (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT UNSIGNED (FK products),
  vendor_id BIGINT UNSIGNED (FK vendors),
  user_id BIGINT UNSIGNED NULL (FK users, for admin actions),
  event VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  metadata JSON,
  created_at TIMESTAMP
);
```

## API Endpoints

### 1. Create Product (Vendor)

**POST** `/api/v1/products`

**Auth**: Required (vendor role)

**Request body**:

```json
{
  "name": "Handmade Pottery Bowl",
  "description": "Beautiful ceramic bowl handcrafted locally",
  "price": 499.99,
  "sku": "POT-BOWL-001",
  "currency": "INR",
  "stock_quantity": 50,
  "tags": ["handmade", "pottery", "eco-friendly"],
  "metadata": {"color": "blue", "size": "medium", "material": "ceramic"},
  "images": [
    {"file_path": "/storage/uploads/products/bowl-1.jpg", "alt_text": "Front view", "is_primary": true},
    {"file_path": "/storage/uploads/products/bowl-2.jpg", "alt_text": "Top view"}
  ]
}
```

**Response** (201):

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "vendor_id": 123,
    "slug": "handmade-pottery-bowl",
    "name": "Handmade Pottery Bowl",
    "description": "Beautiful ceramic bowl handcrafted locally",
    "price": 499.99,
    "currency": "INR",
    "status": "draft",
    "rejection_reason": null,
    "stock_quantity": 50,
    "stock_reserved": 0,
    "tags": ["handmade", "pottery", "eco-friendly"],
    "metadata": {"color": "blue", "size": "medium", "material": "ceramic"},
    "images": [
      {"id": 1, "file_path": "/storage/uploads/products/bowl-1.jpg", "alt_text": "Front view", "is_primary": true, "display_order": 0},
      {"id": 2, "file_path": "/storage/uploads/products/bowl-2.jpg", "alt_text": "Top view", "is_primary": false, "display_order": 1}
    ],
    "created_at": "2026-05-17 14:30:00",
    "updated_at": "2026-05-17 14:30:00"
  }
}
```

**Validation errors** (422):

```json
{
  "status": "error",
  "error": "validation_failed",
  "message": "One or more fields are invalid.",
  "meta": {
    "errors": {
      "name": "Product name is required.",
      "price": "Price must be greater than 0."
    }
  }
}
```

### 2. List Vendor Products (Vendor)

**GET** `/api/v1/products?limit=20&offset=0&status=approved`

**Auth**: Required (vendor role)

**Query parameters**:
- `limit` : int (default: 20)
- `offset` : int (default: 0)
- `status` : string optional (`draft`, `pending`, `approved`, `rejected`)

**Response** (200):

```json
{
  "status": "success",
  "data": {
    "items": [
      { /* product object */ }
    ],
    "total": 45,
    "limit": 20,
    "offset": 0
  }
}
```

### 3. Update Product (Vendor)

**PATCH** `/api/v1/products/{product_id}`

**Auth**: Required (vendor role)

**Request body** (all fields optional):

```json
{
  "name": "Updated Product Name",
  "description": "New description",
  "price": 599.99,
  "stock_quantity": 100,
  "tags": ["new-tag"],
  "metadata": {"new_field": "value"},
  "images": [
    {"file_path": "/storage/uploads/products/new-image.jpg", "alt_text": "New image"}
  ]
}
```

**Response** (200): Returns updated product

**Restrictions**: Only editable in `draft` or `rejected` status

### 4. Submit Product for Approval (Vendor)

**POST** `/api/v1/products/{product_id}/submit`

**Auth**: Required (vendor role)

**Request body**: Empty

**Response** (200): Product now in `pending` status

**Precondition**: Product must be in `draft` status

### 5. Approve Product (Admin)

**POST** `/api/v1/products/{product_id}/approve`

**Auth**: Required (admin or master_admin role)

**Request body**:

```json
{
  "notes": "Looks good! Ready to list."
}
```

**Response** (200): Product now in `approved` status

**Precondition**: Product must be in `pending` status

### 6. Reject Product (Admin)

**POST** `/api/v1/products/{product_id}/reject`

**Auth**: Required (admin or master_admin role)

**Request body**:

```json
{
  "reason": "Image quality insufficient. Please re-upload high-resolution images."
}
```

**Response** (200): Product now in `rejected` status with reason

**Precondition**: Product must be in `pending` or `approved` status

### 7. List Pending Products (Admin)

**GET** `/api/v1/products/admin/pending?limit=20&offset=0`

**Auth**: Required (admin or master_admin role)

**Query parameters**:
- `limit` : int (default: 20)
- `offset` : int (default: 0)

**Response** (200): Paginated list of pending products

## Key Features

### SEO Slug Generation

- Automatically generated from product name
- Lowercase, hyphen-separated, URL-safe
- Unique per vendor (multiple vendors can have same slug)
- Example: `"Handmade Pottery Bowl"` → `"handmade-pottery-bowl"`

### Image Management

- Multiple images per product
- `display_order` for gallery ordering
- `is_primary` flag for thumbnail
- Relative file paths (e.g., `/storage/uploads/products/...`)
- File upload is separate (handled by frontend/file service)

### Inventory Ready

- `stock_quantity` : total available units
- `stock_reserved` : units in carts/orders (for future order system)
- Available units = `stock_quantity - stock_reserved`

### Audit Logging

Every product action is logged:
- `product.created`
- `product.updated`
- `product.submitted`
- `product.approved`
- `product.rejected`

Audit log includes: user ID, IP address, user-agent, event metadata, timestamp.

### Status Workflow

```
draft (vendor creates)
  ↓
pending (vendor submits)
  ├→ approved (admin approves) → product visible in catalog
  └→ rejected (admin rejects) → vendor can edit and resubmit

rejected (after admin rejection)
  ↓
vendor edits (allowed)
  ↓
pending (resubmit)
  ├→ approved
  └→ rejected
```

## Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `validation_failed` | 422 | Invalid payload fields |
| `unauthorized` | 401 | Missing/invalid auth token |
| `forbidden` | 403 | Insufficient role or vendor not active |
| `product_not_found` | 404 | Product does not exist |
| `vendor_not_found` | 404 | User has no vendor profile |
| `product_creation_failed` | 400 | Generic creation error |
| `product_update_failed` | 400 | Generic update error |

## Example curl Commands

### Create a product

```bash
curl -X POST http://localhost:8000/api/v1/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Handmade Pottery",
    "price": 499.99,
    "stock_quantity": 50,
    "images": [
      {"file_path": "/storage/uploads/products/pot.jpg", "alt_text": "Pottery"}
    ]
  }'
```

### List vendor products

```bash
curl http://localhost:8000/api/v1/products?status=approved \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Approve a product (as admin)

```bash
curl -X POST http://localhost:8000/api/v1/products/1/approve \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Approved"}'
```

## Integration Notes

- File uploads are handled separately (not part of this API)
- Frontend must store images and provide `file_path` to product API
- SEO slugs are auto-generated; vendors cannot specify custom slugs
- Metadata (color, size, etc.) is freeform JSON for flexibility
- Audit trail is append-only and never deleted
- Soft deletes via `deleted_at` column (standard pattern)

## Testing

See [VENDOR_REGISTRATION_TESTING.md](VENDOR_REGISTRATION_TESTING.md) for general testing setup. For product endpoints:

1. Create vendor account and get auth token
2. Call `POST /api/v1/products` to create a draft product
3. Call `PATCH /api/v1/products/{id}` to edit
4. Call `POST /api/v1/products/{id}/submit` to request approval
5. Use admin token to call approve/reject endpoints
6. Query audit log via `product_audit_log` table for verification

## Code Files

- Database: [database/schema.sql](database/schema.sql)
- Services: [backend/services/ProductService.php](backend/services/ProductService.php), [backend/services/ProductAuditService.php](backend/services/ProductAuditService.php)
- Routes: [backend/api/v1/routes.php](backend/api/v1/routes.php) (new section: "Phase-2 product catalog")
