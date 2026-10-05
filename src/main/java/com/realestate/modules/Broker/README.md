# Broker Module (Updated – v2.1) – Fixed Startup Error

## Why the previous version failed

Hibernate error:
```
Table [messages] contains physical column name [created_at] 
referred to by multiple logical column names: [createdAt], [created_at]
```

**Cause:** Your main application already has entities for `messages`, `tours` and `reviews`.  
Having a second `@Entity` that maps to the **same table** causes a mapping conflict.

## Solution used in this version

| Feature       | Table used              | Reason |
|---------------|-------------------------|--------|
| Clients       | `clients`               | Reuses existing table + adds `user_id` |
| Tours         | `broker_tours`          | Separate table (avoids conflict) |
| Messages      | `broker_messages`       | Separate table (avoids conflict) |
| Reviews       | `broker_reviews`        | Separate table (avoids conflict) |
| Leads         | `broker_leads`          | Already separate |
| Transactions  | `broker_transactions`   | Already separate |

> Later, if you want to merge into the main tables, just add `broker_id` column to the existing entities and update the services. For now this version starts cleanly.

---

## Required SQL

```sql
-- 1. clients – add user_id (link to existing BUYER)
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS user_id BIGINT NULL AFTER id;

-- 2. Create broker-specific tables (if not already present)

CREATE TABLE IF NOT EXISTS broker_tours (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id      BIGINT NOT NULL,
    property_id   BIGINT NOT NULL,
    broker_id     BIGINT NOT NULL,
    tour_date     DATE NOT NULL,
    tour_time     TIME NOT NULL,
    notes         VARCHAR(1000),
    status        ENUM('PENDING','CONFIRMED','COMPLETED','CANCELLED','REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at    DATETIME(6) NOT NULL,
    updated_at    DATETIME(6),
    CONSTRAINT fk_broker_tours_property FOREIGN KEY (property_id) REFERENCES properties(id),
    CONSTRAINT fk_broker_tours_broker   FOREIGN KEY (broker_id)   REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS broker_messages (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    content          TEXT NOT NULL,
    is_read          BIT(1) NOT NULL DEFAULT 0,
    conversation_id  BIGINT,
    receiver_id      BIGINT NOT NULL,
    sender_id        BIGINT NOT NULL,
    broker_id        BIGINT NOT NULL,
    created_at       DATETIME(6) NOT NULL,
    CONSTRAINT fk_broker_messages_broker FOREIGN KEY (broker_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS broker_reviews (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    comment       TEXT NOT NULL,
    rating        INT NOT NULL,
    status        ENUM('APPROVED','PENDING','REJECTED') NOT NULL DEFAULT 'PENDING',
    user_id       BIGINT NOT NULL,
    property_id   BIGINT NOT NULL,
    broker_id     BIGINT NOT NULL,
    created_at    DATETIME(6) NOT NULL,
    updated_at    DATETIME(6),
    CONSTRAINT fk_broker_reviews_property FOREIGN KEY (property_id) REFERENCES properties(id),
    CONSTRAINT fk_broker_reviews_broker   FOREIGN KEY (broker_id)   REFERENCES users(id)
);
```

---

## Package Location
```
src/main/java/com/realestate/modules/Broker/
```

---

## All API Endpoints (Postman)

Base URL: `http://localhost:8080`  
`{brokerId}` = `users.id` of a user with role **BROKER**

### 1. Clients  `/api/broker/clients`
| Method | URL | Body notes |
|--------|-----|------------|
| POST   | `/api/broker/clients/{brokerId}` | **userId is mandatory** |
| GET    | `/api/broker/clients/{brokerId}` | |
| GET    | `/api/broker/clients/{brokerId}/paged?page=0&size=10` | |
| GET    | `/api/broker/clients/{brokerId}/{clientId}` | |
| PUT    | `/api/broker/clients/{brokerId}/{clientId}` | |
| DELETE | `/api/broker/clients/{brokerId}/{clientId}` | |

**POST example:**
```json
{
  "userId": 15,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "address": "123 Main St",
  "clientType": "BUYER"
}
```

### 2. Properties  `/api/broker/properties`
| Method | URL |
|--------|-----|
| POST   | `/api/broker/properties/{brokerId}` |
| GET    | `/api/broker/properties/{brokerId}` |
| GET    | `/api/broker/properties/{brokerId}/paged?page=0&size=10` |
| GET    | `/api/broker/properties/{brokerId}/{propertyId}` |
| PUT    | `/api/broker/properties/{brokerId}/{propertyId}` |
| DELETE | `/api/broker/properties/{brokerId}/{propertyId}` |

### 3. Tours  `/api/broker/tours`
| Method | URL |
|--------|-----|
| POST   | `/api/broker/tours/{brokerId}` |
| GET    | `/api/broker/tours/{brokerId}` |
| GET    | `/api/broker/tours/{brokerId}/paged?page=0&size=10` |
| GET    | `/api/broker/tours/{brokerId}/pending` |
| GET    | `/api/broker/tours/{brokerId}/{tourId}` |
| PUT    | `/api/broker/tours/{brokerId}/{tourId}` |
| PATCH  | `/api/broker/tours/{brokerId}/{tourId}/status` |
| DELETE | `/api/broker/tours/{brokerId}/{tourId}` |

**POST example:**
```json
{
  "buyerId": 15,
  "propertyId": 3,
  "tourDate": "2026-10-15",
  "tourTime": "11:30:00",
  "notes": "Interested in 2BHK",
  "status": "PENDING"
}
```

**PATCH status:**
```json
{ "status": "CONFIRMED" }
```

### 4. Messages  `/api/broker/messages`
| Method | URL |
|--------|-----|
| POST   | `/api/broker/messages/{brokerId}` |
| GET    | `/api/broker/messages/{brokerId}` |
| GET    | `/api/broker/messages/{brokerId}/paged?page=0&size=10` |
| GET    | `/api/broker/messages/{brokerId}/unread` |
| GET    | `/api/broker/messages/{brokerId}/{messageId}` |
| PATCH  | `/api/broker/messages/{brokerId}/{messageId}/read` |
| DELETE | `/api/broker/messages/{brokerId}/{messageId}` |

**POST example:**
```json
{
  "content": "Hello, is the property still available?",
  "conversationId": 1,
  "senderId": 15,
  "receiverId": 9
}
```

### 5. Reviews  `/api/broker/reviews`
| Method | URL |
|--------|-----|
| POST   | `/api/broker/reviews/{brokerId}` |
| GET    | `/api/broker/reviews/{brokerId}` |
| GET    | `/api/broker/reviews/{brokerId}/paged?page=0&size=10` |
| GET    | `/api/broker/reviews/{brokerId}/{reviewId}` |
| PATCH  | `/api/broker/reviews/{brokerId}/{reviewId}/status` |
| DELETE | `/api/broker/reviews/{brokerId}/{reviewId}` |

**POST example:**
```json
{
  "userId": 15,
  "propertyId": 3,
  "rating": 5,
  "comment": "Excellent broker service!",
  "status": "PENDING"
}
```

### 6. Leads / Transactions / Dashboard
- `/api/broker/leads/{brokerId}`
- `/api/broker/transactions/{brokerId}`
- `/api/broker/dashboard/stats/{brokerId}`

---

## Important Notes about Clients

- Clients are **BUYERS** that already exist in the `users` table.
- When creating a client you **must** send `userId` (the buyer’s `users.id`).
- The module only creates a **link** between broker and buyer in the `clients` table.
- name / email / phone should be copied from the User record on the frontend (or you can later join with users table).
