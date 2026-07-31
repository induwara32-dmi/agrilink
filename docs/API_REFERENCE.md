# AgriLink API Reference

## Contract artifacts

AgriLink exposes a versioned REST API at `/api/v1`. The machine-readable contract is [OpenAPI 3.1](openapi.yaml), and the importable request collection is [AgriLink Postman Collection](AgriLink.postman_collection.json). Both cover all 75 currently registered Express operations and are generated from `scripts/generate-api-docs.mjs`:

```bash
npm run docs:api
```

The route definitions and Zod validators remain the runtime source of truth. Regenerate and commit both artifacts whenever an endpoint contract changes.

## Base URLs

| Environment | Base URL |
| --- | --- |
| Local API | `http://localhost:4000/api/v1` |
| Docker frontend-to-backend | configured through `NEXT_PUBLIC_API_URL` |
| Production | provider URL ending in `/api/v1` |

## Authentication

Protected operations require an access JWT:

```http
Authorization: Bearer <access-token>
```

Access tokens are short lived. `POST /auth/refresh` accepts a refresh token, rotates its token family, and returns a new pair. Clients should retry a failed authorized request only once after a successful refresh. Refresh tokens are credentials: never log them or place them in URLs.

Public registration accepts `BUYER`, `FARMER`, or `TRANSPORTER`. It never accepts `ADMIN`; privileged accounts require an audited bootstrap/administrative workflow.

## Response envelope

Successful response:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": []
  }
}
```

Common status codes are `200`, `201`, `400`, `401`, `403`, `404`, `409`, `413`, `422`, `429`, `500`, and `503`. Production responses do not include stack traces or secrets. Requests may include `X-Request-Id`; the API returns/logs request context for correlation.

## Data conventions

- UUIDs identify persisted resources.
- Timestamps are ISO 8601 values stored and compared in UTC.
- Money is serialized as decimal strings at `Decimal(19,4)` precision.
- Quantities are decimal strings with up to three fractional places.
- Currency is a three-letter uppercase ISO 4217 code.
- Collection pagination uses `page` and `pageSize`; `pageSize` is capped at 100.
- Deletes for commercial resources are generally archive/soft-delete operations.
- Role authorization is always combined with ownership, assignment, account, and lifecycle checks.

## Endpoint groups

| Group | Base paths | Access |
| --- | --- | --- |
| System | `/health`, `/readiness`, `/version` | Public |
| Authentication | `/auth/*` | Public except `/auth/me` |
| Catalog | `/products`, `/search`, `/categories` | Public reads; farmer/admin mutations |
| Inventory | `/products/{id}/inventory*`, `/inventory/low-stock` | Farmer owner or admin |
| Cart and checkout | `/cart*`, `/checkout*` | Buyer |
| Orders | `/orders*` | Buyer, farmer, or admin as scoped |
| Transport jobs | `/transport-jobs*` | Transporter/admin; assignment is admin-only |
| Deliveries | `/deliveries*` | Related buyer/farmer/transporter or admin |
| Vehicles | `/vehicles*` | Authenticated; ownership/admin rules apply |
| Notifications | `/notifications*` | Recipient; manual creation is admin-only |
| Analytics | `/analytics/{role}` | Matching role only |
| Media | product images, `/me/avatar`, delivery proof | Authenticated role and ownership rules |

## Query behavior

Product collections support search, category/farmer filters, status, minimum/maximum price, pagination, and `newest`, `oldest`, `priceAsc`, `priceDesc`, `nameAsc`, or `nameDesc` sorting. Order collections support search and aggregate status filters.

Analytics accepts `period=day|week|month|year|custom`. Custom requests require ordered `from` and `to` ISO timestamps and cannot span more than five years. Reports include the equivalent preceding period and keep unlike currencies separate.

## Uploads

Media endpoints use `multipart/form-data` and validated Multer memory buffers that are streamed to Cloudinary.

| Upload | Field | Per-file limit | Count/record limit | Roles |
| --- | --- | --- | --- | --- |
| Product images | `images` | 5 MiB | 5/request, 8/product | Farmer owner, admin |
| Profile image | `image` | 3 MiB | 1/profile | Any authenticated role, self only |
| Delivery proof | `image` | 8 MiB | 1/delivery | Assigned transporter or farmer-delivery owner |

JPEG, PNG, and WebP are supported. Delivery proof additionally requires `receiverName` and permits notes/signature metadata. If database persistence fails after upload, the service attempts to remove the Cloudinary asset.

## Postman workflow

1. Import `docs/AgriLink.postman_collection.json`.
2. Set `baseUrl` (default `http://localhost:4000`) and relevant resource UUID variables.
3. Run Login and copy the returned access/refresh tokens into `accessToken` and `refreshToken`.
4. Select credentials for the role required by each folder/request.
5. Select local files manually for multipart requests; Postman collections do not embed local paths.

The collection intentionally does not include destructive automated test scripts or production credentials.

## Implemented versus planned

The checked-in OpenAPI file documents only implemented routes. Payment provider APIs, conversations/messages, wishlist APIs, recently-viewed APIs, admin verification APIs, and WebSocket/live-location delivery are planned domain capabilities and are not currently exposed by the Express router.
