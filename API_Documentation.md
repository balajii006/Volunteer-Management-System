# VMS-API Documentation

**Base URLs (Production):**
- Gateway: `https://gateway-service-production-37b5.up.railway.app/vms-api`
- User Service: `https://vms-user-service-production-b71e.up.railway.app`
- Event Service: `https://vms-event-service-production.up.railway.app`
- Notification Service: `https://vms-notification-service-production.up.railway.app`

---

## Authentication

All protected endpoints require a JWT Bearer token in the `Authorization` header:
```
Authorization: Bearer <accessToken>
```

**JWT Token Details:**
- Access Token expiry: 1 hour (3600s)
- Refresh Token expiry: 7 days (604800s)
- Token claims: `userId`, `username`, `sub`, `role`, `roles`, `iss`, `exp`, `iat`

---

## User Service

### Authentication (`/api/auth`)

#### POST `/api/auth/register` — Register a new user
**Auth:** None

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Test@1234",
  "phoneNumber": "1234567890"
}
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| username | String | Yes | 3-50 characters |
| email | String | Yes | Valid email, max 120 chars |
| password | String | Yes | 8-120 characters |
| phoneNumber | String | Yes | 7-30 characters |

**Response:** `201 Created`
```json
{
  "id": "6b5e02c6-cf30-48d4-9d65-7774ce5c5c7e",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "VOLUNTEER",
  "phoneNumber": "1234567890",
  "createdAt": "2026-03-11T02:24:53Z",
  "updatedAt": "2026-03-11T02:24:53Z"
}
```

---

#### POST `/api/auth/login` — Login
**Auth:** None

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Test@1234"
}
```

**Response:** `200 OK`
```json
{
  "tokens": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  },
  "user": {
    "id": "6b5e02c6-cf30-48d4-9d65-7774ce5c5c7e",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "VOLUNTEER",
    "phoneNumber": "1234567890",
    "createdAt": "2026-03-11T02:24:53Z",
    "updatedAt": "2026-03-11T02:24:53Z"
  }
}
```

---

#### POST `/api/auth/refresh` — Refresh access token
**Auth:** None

**Request Body:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response:** `200 OK` — Same structure as login response

---

#### POST `/api/auth/change-password` — Change password
**Auth:** Required (Bearer Token)

**Request Body:**
```json
{
  "currentPassword": "OldPass@123",
  "newPassword": "NewPass@456"
}
```

**Response:** `200 OK`
```json
{ "message": "Password updated." }
```

---

#### POST `/api/auth/logout` — Logout (revoke refresh token)
**Auth:** None

**Request Body:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response:** `200 OK`
```json
{ "message": "Logged out." }
```

---

#### POST `/api/auth/forgot-password` — Request password reset
**Auth:** None

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset token created.",
  "resetToken": "abc123..."
}
```

---

#### POST `/api/auth/reset-password` — Reset password with token
**Auth:** None

**Request Body:**
```json
{
  "resetToken": "abc123...",
  "newPassword": "NewPass@789"
}
```

**Response:** `200 OK`
```json
{ "message": "Password reset successful." }
```

---

### Users (`/api/users`)

#### GET `/api/users/me` — Get current user profile
**Auth:** Required (Bearer Token)

**Response:** `200 OK` — `UserResponse` object

---

#### GET `/api/users/profile` — Get current user profile (alias)
**Auth:** Required (Bearer Token)

**Response:** `200 OK` — `UserResponse` object (same as `/api/users/me`)

---

#### PUT `/api/users/me` — Update current user
**Auth:** Required (Bearer Token)

**Request Body:**
```json
{
  "username": "new_name",
  "email": "newemail@example.com",
  "phoneNumber": "9876543210"
}
```
All fields are optional. Users cannot change their own role.

**Response:** `200 OK` — Updated `UserResponse`

---

#### GET `/api/users` — List all users
**Auth:** Required (Bearer Token)

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| role | String | Filter by role: `VOLUNTEER`, `ORGANIZER`, `ADMIN` |

**Response:** `200 OK` — Array of `UserResponse`

---

#### GET `/api/users/{id}` — Get user by ID
**Auth:** Required (Bearer Token)

**Response:** `200 OK` — `UserResponse`

---

#### PUT `/api/users/{id}` — Update user by ID (admin)
**Auth:** Required (Bearer Token)

**Request Body:** Same as PUT `/api/users/me` but can also update `role`.

**Response:** `200 OK` — Updated `UserResponse`

---

#### DELETE `/api/users/{id}` — Delete user
**Auth:** Required (Bearer Token)

**Response:** `200 OK`

---

## Event Service

### Events (`/api/events`)

#### POST `/api/events` — Create event
**Auth:** Required (Bearer Token)

**Request Body:**
```json
{
  "title": "Community Cleanup",
  "description": "Help clean the park",
  "location": "Central Park",
  "eventDate": "2026-04-15T10:00:00",
  "requiredVolunteers": 20
}
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | String | Yes | 1-200 characters |
| description | String | No | — |
| location | String | Yes | 1-500 characters |
| eventDate | DateTime | Yes | Must be in the future (ISO 8601) |
| requiredVolunteers | Integer | Yes | Minimum 1 |

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Community Cleanup",
  "description": "Help clean the park",
  "location": "Central Park",
  "eventDate": "2026-04-15T10:00:00",
  "requiredVolunteers": 20,
  "registeredVolunteers": 0,
  "organizerId": "uuid",
  "organizerName": "john_doe",
  "status": "OPEN",
  "averageRating": 0.0,
  "createdAt": "2026-03-11T02:30:00Z",
  "updatedAt": "2026-03-11T02:30:00Z"
}
```

---

#### GET `/api/events` — List all events
**Auth:** None

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| upcoming | Boolean | If `true`, returns only future events |

**Response:** `200 OK` — Array of `EventResponse`

---

#### GET `/api/events/{id}` — Get event by ID
**Auth:** None

**Response:** `200 OK` — `EventResponse`

---

#### GET `/api/events/organizer/my-events` — Get my organized events
**Auth:** Required (Bearer Token)

**Response:** `200 OK` — Array of `EventResponse`

---

#### PUT `/api/events/{id}` — Update event
**Auth:** Required (Bearer Token, organizer only)

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "location": "New Location",
  "eventDate": "2026-05-01T10:00:00",
  "requiredVolunteers": 30,
  "status": "COMPLETED"
}
```
All fields optional. **Status values:** `OPEN`, `FULL`, `COMPLETED`, `CANCELLED`

**Response:** `200 OK` — Updated `EventResponse`

---

#### DELETE `/api/events/{id}` — Delete event
**Auth:** Required (Bearer Token, organizer only)

**Response:** `200 OK`

---

### Participations (`/api/participations`)

#### POST `/api/participations/events/{eventId}/register` — Register for event
**Auth:** Required (Bearer Token)

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "eventId": "uuid",
  "eventTitle": "Community Cleanup",
  "volunteerId": "uuid",
  "volunteerName": "john_doe",
  "volunteerEmail": "john@example.com",
  "status": "REGISTERED",
  "rolePlayed": null,
  "registeredAt": "2026-03-11T02:35:00Z"
}
```

---

#### POST `/api/participations/events/{eventId}/cancel` — Cancel participation
**Auth:** Required (Bearer Token)

**Response:** `200 OK`
```json
{ "message": "Participation cancelled successfully" }
```

---

#### GET `/api/participations/events/{eventId}` — Get event participants
**Auth:** None

**Response:** `200 OK` — Array of `ParticipationResponse`

---

#### GET `/api/participations/events/{eventId}/participants` — Get event participants (alias)
**Auth:** None

**Response:** `200 OK` — Array of `ParticipationResponse` (same as above)

---

#### GET `/api/participations/my-participations` — Get my participations
**Auth:** Required (Bearer Token)

**Response:** `200 OK` — Array of `ParticipationResponse`

---

#### GET `/api/participations/me` — Get my participations (alias)
**Auth:** Required (Bearer Token)

**Response:** `200 OK` — Array of `ParticipationResponse` (same as above)

---

#### PUT `/api/participations/{participationId}/mark-attended` — Mark attended
**Auth:** None (organizer operation)

**Response:** `200 OK` — `ParticipationResponse`

---

#### PUT `/api/participations/events/{eventId}/volunteers/{volunteerId}/attendance` — Mark attendance
**Auth:** None (organizer operation)

**Query Parameters:**
| Param | Type | Required |
|-------|------|----------|
| attended | Boolean | Yes |

**Response:** `200 OK`
```json
{ "message": "Attendance marked successfully" }
```

---

#### PUT `/api/participations/events/{eventId}/volunteers/{volunteerId}/role` — Assign role
**Auth:** None (organizer operation)

**Query Parameters:**
| Param | Type | Required |
|-------|------|----------|
| role | String | Yes |

**Response:** `200 OK`
```json
{ "message": "Role updated successfully" }
```

---

### Feedbacks (`/api/feedbacks`)

#### POST `/api/feedbacks/events/{eventId}` — Submit feedback
**Auth:** Required (Bearer Token)

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great event!"
}
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| rating | Integer | Yes | 1-5 |
| comment | String | No | Max 1000 characters |

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "eventId": "uuid",
  "volunteerId": "uuid",
  "volunteerName": "john_doe",
  "rating": 5,
  "comment": "Great event!",
  "createdAt": "2026-03-11T03:00:00Z"
}
```

---

#### POST `/api/feedbacks/events/{eventId}/submit` — Submit feedback (alias)
**Auth:** Required (Bearer Token)

**Request Body & Response:** Same as `POST /api/feedbacks/events/{eventId}`

---

#### GET `/api/feedbacks/events/{eventId}` — Get event feedbacks
**Auth:** None

**Response:** `200 OK` — Array of `FeedbackResponse`

---

#### GET `/api/feedbacks/events/{eventId}/average-rating` — Get average rating
**Auth:** None

**Response:** `200 OK` — `0.0` (Double, defaults to 0.0 if no feedback)

---

## Notification Service

### Notifications (`/api/notifications`)

#### POST `/api/notifications` — Create notification
**Auth:** None (system/internal)

**Request Body:**
```json
{
  "recipientId": "uuid",
  "recipientEmail": "john@example.com",
  "type": "EVENT_CREATED",
  "subject": "New Event Available",
  "message": "A new event has been created.",
  "eventId": "uuid"
}
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| recipientId | UUID | Yes | — |
| recipientEmail | String | Yes | Valid email |
| type | NotificationType | Yes | See enum below |
| subject | String | Yes | 1-200 characters |
| message | String | Yes | — |
| eventId | UUID | No | Associated event |

**Response:** `200 OK` — `NotificationResponse`
```json
{
  "id": "uuid",
  "type": "EVENT_CREATED",
  "subject": "New Event Available",
  "message": "A new event has been created.",
  "eventId": "uuid",
  "status": "PENDING",
  "createdAt": "2026-03-11T03:00:00Z",
  "sentAt": null,
  "readAt": null
}
```

---

#### POST `/api/notifications/{id}/send` — Send notification
**Auth:** None (system/internal)

**Response:** `200 OK`
```json
{ "message": "Notification sent successfully" }
```

---

#### POST `/api/notifications/send-pending` — Process pending notifications
**Auth:** None (system/internal)

**Response:** `200 OK`
```json
{ "message": "Pending notifications processed" }
```

---

#### GET `/api/notifications` — Get my notifications (alias)
**Auth:** Required (Bearer Token)

**Response:** `200 OK` — Array of `NotificationResponse` (same as `/my-notifications`)

---

#### GET `/api/notifications/my-notifications` — Get my notifications
**Auth:** Required (Bearer Token)

**Response:** `200 OK` — Array of `NotificationResponse`

---

#### GET `/api/notifications/unread` — Get unread notifications
**Auth:** Required (Bearer Token)

**Response:** `200 OK` — Array of `NotificationResponse`

---

#### GET `/api/notifications/unread-count` — Get unread count
**Auth:** Required (Bearer Token)

**Response:** `200 OK`
```json
{ "unreadCount": 3 }
```

---

#### PUT `/api/notifications/{id}/read` — Mark as read
**Auth:** Required (Bearer Token)

**Response:** `200 OK`
```json
{ "message": "Notification marked as read" }
```

---

#### PUT `/api/notifications/read-all` — Mark all as read
**Auth:** Required (Bearer Token)

**Response:** `200 OK`
```json
{ "message": "All notifications marked as read" }
```

---

## Enums

| Enum | Values |
|------|--------|
| Role | `VOLUNTEER`, `ORGANIZER`, `ADMIN` |
| EventStatus | `OPEN`, `FULL`, `COMPLETED`, `CANCELLED` |
| ParticipationStatus | `REGISTERED`, `ATTENDED`, `CANCELLED`, `NO_SHOW` |
| NotificationStatus | `PENDING`, `SENT`, `FAILED`, `READ` |
| NotificationType | `EVENT_CREATED`, `EVENT_UPDATED`, `EVENT_CANCELLED`, `VOLUNTEER_REGISTERED`, `VOLUNTEER_CANCELLED`, `EVENT_REMINDER`, `EVENT_COMPLETED` |

---

## Error Responses

All services return errors in a consistent format:

```json
{
  "timestamp": "2026-03-11T03:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for field 'email'"
}
```

| HTTP Status | Description |
|-------------|-------------|
| 400 | Bad Request — Validation error or invalid input |
| 401 | Unauthorized — Missing or invalid JWT token |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found — Resource does not exist |
| 409 | Conflict — Duplicate resource (e.g., email already registered) |
| 500 | Internal Server Error |

---

## Gateway Routes

All VMS-API endpoints are available through the API Gateway at:
`https://gateway-service-production-37b5.up.railway.app`

Routes use the `/vms-api` prefix with `StripPrefix=1`:

| Gateway Path | Service | Target URL |
|---|---|---|
| `/vms-api/api/auth/**` | vms-user-service | `https://vms-user-service-production-b71e.up.railway.app` |
| `/vms-api/api/users/**` | vms-user-service | `https://vms-user-service-production-b71e.up.railway.app` |
| `/vms-api/api/events/**` | vms-event-service | `https://vms-event-service-production.up.railway.app` |
| `/vms-api/api/participations/**` | vms-event-service | `https://vms-event-service-production.up.railway.app` |
| `/vms-api/api/feedbacks/**` | vms-event-service | `https://vms-event-service-production.up.railway.app` |
| `/vms-api/api/notifications/**` | vms-notification-service | `https://vms-notification-service-production.up.railway.app` |

**Example:** `POST https://gateway-service-production-37b5.up.railway.app/vms-api/api/auth/login`

---

## Service Configuration

| Service | Port | Database | Features |
|---------|------|----------|----------|
| User Service | 8081 | MySQL | JWT auth, Eureka, Config Server |
| Event Service | 8082 | MySQL | Eureka, Config Server, Caching, Resilience4j circuit breaker, Rate limiter (100 req/min) |
| Notification Service | 8083 | MySQL | Eureka, Email (SMTP), Async thread pool (core: 5, max: 10), Resilience4j circuit breaker |
| API Gateway | 8080 | — | Spring Cloud Gateway, Eureka, Config Server |
