# E-Commerce Backend - Complete System Summary

## 📋 Overview

This is a **Microservices-based E-Commerce Backend** built with **Spring Boot 3.4.3**, **Java 21**, and **Spring Cloud 2024.0.0**. The system follows a distributed architecture pattern with service discovery, centralized configuration, and an API Gateway.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENTS                                        │
│                        (Web Browser / Mobile App / etc.)                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY (Port 8080)                              │
│                         Spring Cloud Gateway                                     │
│              - Route Management   - Load Balancing   - CORS Handling            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
            ┌───────────────────────────┼───────────────────────────┐
            │                           │                           │
            ▼                           ▼                           ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│   USER SERVICE      │   │  PRODUCT SERVICE    │   │   ORDER SERVICE     │
│    (Port 8082)      │   │    (Port 8081)      │   │    (Port 8083)      │
│                     │   │                     │   │                     │
│  - Authentication   │   │  - Product CRUD     │   │  - Order Management │
│  - User Management  │   │  - Reviews & FAQs   │   │  - Cart Management  │
│  - Address Book     │   │  - Search/Filter    │   │  - Payment Processing│
│  - Session Tracking │   │  - Image Upload     │   │  - Stock Validation │
│                     │   │                     │   │                     │
│  Database: MongoDB  │   │ Database: PostgreSQL│   │ Database: PostgreSQL│
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
            │                                                   │
            │                                                   │
            └───────────────────────────────────────────────────┘
                           Inter-Service Communication
                           (REST via Eureka Discovery)
                                        
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE SERVICES                                   │
├─────────────────────┬─────────────────────┬─────────────────────────────────────┤
│  EUREKA SERVER      │   CONFIG SERVER     │         RABBITMQ                    │
│   (Port 8761)       │    (Port 8888)      │     (Port 5672/15672)               │
│                     │                     │                                      │
│  Service Discovery  │ Centralized Config  │  Message Bus for Config Refresh     │
└─────────────────────┴─────────────────────┴─────────────────────────────────────┘
```

---

## 📂 Project Structure

```
ecom-applications/
├── configserver/                # Centralized Configuration Server
│   └── src/main/
│       ├── java/.../ConfigserverApplication.java
│       └── resources/
│           ├── application.yml
│           └── config/          # Service-specific configurations
│               ├── gateway-service.yml
│               ├── user-service.yml
│               ├── product-service.yml
│               └── order-service.yml
│
├── eureka/                      # Service Discovery Server
│   └── src/main/
│       ├── java/.../EurekaApplication.java
│       └── resources/application.yml
│
├── gateway/                     # API Gateway
│   └── src/main/java/com/ecommerce/gateway/
│       ├── GatewayApplication.java
│       ├── GateWayConfig.java   # Route definitions
│       ├── CorsConfig.java      # CORS configuration
│       ├── JwtAuthFilter.java   # JWT validation filter
│       └── LoggingFilter.java   # Request logging
│
├── user/                        # User Microservice
│   └── src/main/java/com/ecommerce/user/
│       ├── config/              # Security & app configs
│       ├── controllers/         # REST endpoints
│       ├── dto/                 # Data transfer objects
│       ├── exception/           # Custom exceptions
│       ├── models/              # MongoDB documents
│       ├── repository/          # Data access layer
│       ├── security/            # JWT & OAuth2
│       ├── services/            # Business logic
│       └── utils/               # Utility classes
│
├── product/                     # Product Microservice
│   └── src/main/java/com/ecommerce/product/
│       ├── config/              # App configurations
│       ├── controllers/         # REST endpoints
│       ├── dtos/                # Data transfer objects
│       ├── models/              # JPA entities
│       ├── repositories/        # Data access layer
│       ├── services/            # Business logic
│       └── specifications/      # JPA Specifications for filtering
│
├── order/                       # Order Microservice
│   └── src/main/java/com/ecommerce/order/
│       ├── clients/             # Feign clients for inter-service
│       ├── config/              # App configurations
│       ├── controller/          # REST endpoints
│       ├── dtos/                # Data transfer objects
│       ├── models/              # JPA entities
│       ├── repositories/        # Data access layer
│       └── services/            # Business logic
│
├── docker-compose.yml           # Docker services (PostgreSQL, RabbitMQ)
└── logs/                        # Centralized logs directory
```

---

## 🗄️ Database Architecture & Table Relationships

### User Service (MongoDB Atlas)

```
MongoDB Database: ecom_user
├── Collection: users
├── Collection: addresses
├── Collection: roles
├── Collection: refresh_tokens
├── Collection: password_reset_tokens
├── Collection: user_sessions
├── Collection: oauth2_tokens
└── Collection: oauth2_user_info
```

#### Collection Schemas

**1. users**
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| name | String | User's full name |
| email | String | Unique, indexed |
| password | String | BCrypt hashed |
| phone | String | Phone number |
| avatar | String | Avatar URL |
| enabled | Boolean | Account status |
| roles | Set<String> | User roles |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update |

**2. addresses** (One-to-Many with User)
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| user_id | String | FK → users._id |
| label | String | "Home", "Work", etc. |
| is_default | Boolean | Default address flag |
| first_name | String | Recipient first name |
| last_name | String | Recipient last name |
| phone | String | Contact phone |
| street | String | Street address |
| village | String | Cambodia: ភូមិ |
| commune | String | Cambodia: ឃុំ/សង្កាត់ |
| district | String | Cambodia: ស្រុក/ខណ្ឌ |
| province | String | Cambodia: ខេត្ត/រាជធានី |
| postal_code | String | Postal/ZIP code |
| country | String | Default: Cambodia |

**3. user_sessions** (One-to-Many with User)
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| user_id | String | FK → users._id |
| session_token | String | Unique session identifier |
| device_info | String | Device description |
| browser | String | Browser name |
| operating_system | String | OS name |
| ip_address | String | Client IP |
| location | String | Geo location |
| is_current | Boolean | Current session flag |
| is_active | Boolean | Session active status |
| created_at | DateTime | Login time |
| last_activity | DateTime | Last activity |
| expires_at | DateTime | Expiration time |

**4. refresh_tokens** (One-to-One with User)
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| token | String | Unique refresh token |
| user_id | String | FK → users._id |
| expiry_date | Instant | Token expiration |
| created_at | DateTime | Creation time |

**5. password_reset_tokens**
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Primary key |
| token | String | Unique reset token |
| user_id | String | FK → users._id |
| email | String | User's email |
| expires_at | DateTime | Token expiration |
| used | Boolean | Token used flag |
| created_at | DateTime | Creation time |

---

### Product Service (PostgreSQL)

```
PostgreSQL Database: product
├── Table: products
├── Table: product_images
├── Table: product_sizes
├── Table: product_colors
├── Table: product_review
└── Table: product_faq
```

#### Table Schemas

**1. products**
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| name | VARCHAR | Product name |
| description | TEXT | Product description |
| price | DECIMAL | Regular price |
| discount_price | DECIMAL | Sale price |
| stock_quantity | INTEGER | Available stock |
| category | VARCHAR | Product category |
| seller_id | VARCHAR | User ID of seller |
| seller_name | VARCHAR | Seller display name |
| brand | VARCHAR | Brand name |
| rating | DOUBLE | Average rating |
| num_reviews | INTEGER | Review count |
| active | BOOLEAN | Product visibility |
| dress_style | VARCHAR | Style category |
| image_url | VARCHAR | Deprecated |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update |

**2. product_images** (One-to-Many with Product)
| Column | Type | Description |
|--------|------|-------------|
| product_id | BIGINT | FK → products.id |
| image_url | VARCHAR | Image URL |

**3. product_sizes** (One-to-Many with Product)
| Column | Type | Description |
|--------|------|-------------|
| product_id | BIGINT | FK → products.id |
| size | VARCHAR | Size value (S, M, L, etc.) |

**4. product_colors** (One-to-Many with Product)
| Column | Type | Description |
|--------|------|-------------|
| product_id | BIGINT | FK → products.id |
| color | VARCHAR | Color name/code |

**5. product_review** (Many-to-One with Product)
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| product_id | BIGINT | FK → products.id |
| user_id | BIGINT | Reviewer user ID |
| user | VARCHAR | Reviewer name |
| rating | INTEGER | 1-5 stars |
| content | TEXT | Review text |
| date | TIMESTAMP | Review date |
| verified_purchase | BOOLEAN | Verified buyer |
| helpful_count | INTEGER | Helpful votes |

**6. product_faq** (Many-to-One with Product)
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| product_id | BIGINT | FK → products.id |
| question | TEXT | FAQ question |
| answer | TEXT | FAQ answer |

---

### Order Service (PostgreSQL)

```
PostgreSQL Database: order
├── Table: orders
├── Table: order_item
└── Table: cart_item
```

#### Table Schemas

**1. orders**
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| user_id | VARCHAR | User who placed order |
| total_amount | DECIMAL | Order total |
| status | VARCHAR | PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED |
| payment_method | VARCHAR | COD, PayPal, KHQR |
| items_price | DECIMAL | Subtotal |
| tax_price | DECIMAL | Tax amount |
| shipping_price | DECIMAL | Shipping cost |
| is_paid | BOOLEAN | Payment status |
| paid_at | TIMESTAMP | Payment time |
| is_delivered | BOOLEAN | Delivery status |
| delivered_at | TIMESTAMP | Delivery time |
| paypal_order_id | VARCHAR | PayPal reference |
| stripe_client_secret | VARCHAR | Stripe reference |
| payment_id | VARCHAR | Payment gateway ID |
| payment_status | VARCHAR | Payment status |
| payment_update_time | VARCHAR | Payment update |
| payment_email_address | VARCHAR | Payer email |
| first_name | VARCHAR | Shipping: first name |
| last_name | VARCHAR | Shipping: last name |
| street | VARCHAR | Shipping: street |
| city | VARCHAR | Shipping: city |
| state | VARCHAR | Shipping: state |
| zip_code | VARCHAR | Shipping: ZIP |
| country | VARCHAR | Shipping: country |
| phone | VARCHAR | Shipping: phone |
| created_at | TIMESTAMP | Order creation |
| updated_at | TIMESTAMP | Last update |

**2. order_item** (Many-to-One with Order)
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| order_id | BIGINT | FK → orders.id |
| product_id | VARCHAR | Product reference |
| quantity | INTEGER | Quantity ordered |
| price | DECIMAL | Unit price |

**3. cart_item**
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| user_id | VARCHAR | Cart owner |
| product_id | VARCHAR | Product reference |
| quantity | INTEGER | Quantity |
| price | DECIMAL | Unit price |
| product_name | VARCHAR | Cached product name |
| product_image | VARCHAR | Cached image URL |
| selected_color | VARCHAR | Selected variant |
| selected_size | VARCHAR | Selected size |
| created_at | TIMESTAMP | Added time |
| updated_at | TIMESTAMP | Last update |

---

## 🔗 Entity Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER SERVICE (MongoDB)                              │
│                                                                                  │
│  ┌─────────┐  1:N  ┌───────────┐       ┌─────────────────────┐                 │
│  │  User   │───────│  Address  │       │  PasswordResetToken │                 │
│  └─────────┘       └───────────┘       └─────────────────────┘                 │
│       │                                          ▲                              │
│       │ 1:N                                      │ 1:1                          │
│       ▼                                          │                              │
│  ┌─────────────┐                           ┌─────┴─────┐                       │
│  │ UserSession │                           │   User    │                       │
│  └─────────────┘                           └───────────┘                       │
│       │                                          │                              │
│       │                                          │ 1:1                          │
│       │                                          ▼                              │
│       │                                   ┌──────────────┐                      │
│       │                                   │ RefreshToken │                      │
│       │                                   └──────────────┘                      │
└───────┼─────────────────────────────────────────────────────────────────────────┘
        │ Cross-Service Reference (user_id)
        │
┌───────┼─────────────────────────────────────────────────────────────────────────┐
│       │                         PRODUCT SERVICE (PostgreSQL)                     │
│       │                                                                          │
│       │    ┌─────────────┐  1:N  ┌───────────────┐                             │
│       └───▶│   Product   │───────│ ProductReview │                             │
│            └─────────────┘       └───────────────┘                             │
│                  │                                                               │
│                  │ 1:N                                                           │
│                  ├────────────▶ ProductImage                                    │
│                  ├────────────▶ ProductSize                                     │
│                  ├────────────▶ ProductColor                                    │
│                  └────────────▶ ProductFAQ                                      │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
        │ Cross-Service Reference (product_id, seller_id)
        │
┌───────┼─────────────────────────────────────────────────────────────────────────┐
│       │                          ORDER SERVICE (PostgreSQL)                      │
│       │                                                                          │
│       │    ┌─────────────┐  1:N  ┌─────────────┐                               │
│       └───▶│    Order    │───────│  OrderItem  │                               │
│            └─────────────┘       └─────────────┘                               │
│                  │                      │                                        │
│                  │                      │ References                             │
│                  │                      ▼                                        │
│                  │              (product_id → Product Service)                   │
│                  │                                                               │
│                  │ User's Cart                                                   │
│                  │                                                               │
│            ┌─────────────┐                                                       │
│            │  CartItem   │──────▶ (product_id → Product Service)               │
│            └─────────────┘       (user_id → User Service)                       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Service Integration

### Inter-Service Communication Pattern

The system uses **synchronous HTTP communication** via Spring's `RestClient` with **Eureka service discovery** for load balancing.

```
Order Service ──HTTP──▶ Product Service
     │                      │
     │ GET /api/products/{id}
     │ PUT /api/products/{id}/reduce-stock
     │
     └──HTTP──▶ User Service
                    │
                    GET /api/users/{id}
```

### Service Client Implementation

**ProductServiceClient** (Order → Product)
```java
@HttpExchange
public interface ProductServiceClient {
    @GetExchange("/api/products/{id}")
    ProductResponse getProductDetails(@PathVariable String id);

    @PutExchange("/api/products/{id}/reduce-stock")
    void reduceStock(@PathVariable String id, @RequestParam Integer quantity);
}
```

**UserServiceClient** (Order → User)
```java
@HttpExchange
public interface UserServiceClient {
    @GetExchange("/api/users/{id}")
    UserResponse getUserDetails(@PathVariable String id);
}
```

### Service Discovery Configuration

All services register with **Eureka** at startup:
```yaml
eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
    register-with-eureka: true
    fetch-registry: true
```

### Service URLs (via Eureka)
- `http://product-service` → resolves to Product Service instances
- `http://user-service` → resolves to User Service instances
- `http://order-service` → resolves to Order Service instances

---

