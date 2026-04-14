# API Reference

All endpoints are under `app/api` and return JSON.

## Authentication Model

- Most endpoints require an authenticated session.
- Admin endpoints require `ADMIN` role.
- Auth is managed by NextAuth credentials provider.

## Public Endpoint

### `POST /api/auth/signup`

Create a user account and initialize subscription, usage, and thresholds.

Request:

```json
{
  "email": "new-user@example.com",
  "password": "strong_password"
}
```

## User Endpoints

### `POST /api/moderate`

Moderate one text message.

Request:

```json
{
  "text": "some content"
}
```

Response includes:

- `probabilities`
- `flagged`
- `maxLabel`
- `maxScore`
- `apiUsage`

### `POST /api/moderate-batch`

Moderate many text items in one request.

Request:

```json
{
  "texts": ["text one", "text two"]
}
```

Response includes:

- `batchId`
- `totalTexts`
- `flaggedCount`
- `results`
- `batchUsage`

### `GET /api/analytics`

Returns current user analytics, trend data, and label summary.

### `GET /api/moderation-history`

Returns latest moderation logs for current user.

### `GET /api/batch-history`

Returns latest batch jobs for current user with job status and completion percent.

### `GET /api/batch-history/[id]`

Returns full results for one batch job.

### `GET /api/thresholds`

Returns current user's thresholds keyed by label.

### `POST /api/thresholds`

Update thresholds.

Request:

```json
{
  "thresholds": {
    "toxic": 0.5,
    "severe_toxic": 0.4,
    "obscene": 0.5,
    "threat": 0.6,
    "insult": 0.5,
    "identity_hate": 0.4
  }
}
```

### `GET /api/profile`

Returns profile details, API key, subscription, and usage metrics.

### `PUT /api/profile`

Update profile fields.

Request:

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "username": "janedoe"
}
```

### `POST /api/profile/change-password`

Request:

```json
{
  "currentPassword": "old_password",
  "newPassword": "new_secure_password"
}
```

## Admin Endpoints

### `GET /api/admin/stats`

Returns platform-level usage and activity metrics.

### `GET /api/admin/users`

Returns user list with counts and role metadata.

## Error Conventions

Common status codes:

- `400` bad input
- `401` unauthorized
- `403` forbidden
- `404` not found
- `409` conflict (for example duplicate email/username)
- `429` usage limits exceeded
- `500` internal server error
