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

## 🔐 Authentication & Authorization

### Authentication Flow

```
┌─────────┐                ┌─────────────┐              ┌─────────────┐
│  Client │                │   Gateway   │              │User Service │
└────┬────┘                └──────┬──────┘              └──────┬──────┘
     │                            │                            │
     │  POST /api/auth/login      │                            │
     │  {email, password}         │                            │
     │ ──────────────────────────▶│                            │
     │                            │ Forward to USER-SERVICE    │
     │                            │ ───────────────────────────▶│
     │                            │                            │
     │                            │        Validate credentials│
     │                            │        Generate JWT tokens │
     │                            │        Create session      │
     │                            │                            │
     │                            │◀─────────────────────────── │
     │                            │  {accessToken, refreshToken,│
     │                            │   sessionToken, userInfo}  │
     │◀─────────────────────────── │                            │
     │                            │                            │
     │  GET /api/products         │                            │
     │  Authorization: Bearer xxx │                            │
     │ ──────────────────────────▶│                            │
     │                            │ Validate JWT (optional)    │
     │                            │ Forward to PRODUCT-SERVICE │
     │                            │                            │
```

### JWT Token Structure

```json
{
  "sub": "userId",
  "email": "user@example.com",
  "roles": "ROLE_CUSTOMER,ROLE_USER",
  "iat": 1706625600,
  "exp": 1706626500
}
```

### Token Configuration
```yaml
jwt:
  secret: your-256-bit-secret-key-here-at-least-32-characters-long
  access-token-expiration-ms: 900000      # 15 minutes
  refresh-token-expiration-ms: 2592000000  # 30 days
```

### Security Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.disable())  // Handled by Gateway
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/auth/**", "/api/auth/**").permitAll()
                .requestMatchers("/api/oauth2/**", "/oauth2/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> 
                    userInfo.userService(customOAuth2UserService))
                .successHandler(oAuth2AuthenticationSuccessHandler)
            );
        
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `ROLE_CUSTOMER` | Regular customer | Browse, cart, checkout, own orders |
| `ROLE_USER` | Seller/Vendor | All customer + manage own products |
| `ROLE_ADMIN` | Administrator | Full system access |

### Role Hierarchy
```
ROLE_ADMIN > ROLE_USER > ROLE_CUSTOMER
```

### OAuth2 Providers

The system supports 3 OAuth2 providers:
- **Google**: `https://www.googleapis.com/oauth2/v4/userinfo`
- **GitHub**: `https://api.github.com/user`
- **Facebook**: `https://graph.facebook.com/me`

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            redirect-uri: http://localhost:8082/oauth2/callback/google
            scope: email,profile
```

---

## ⚙️ Configuration Management

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CONFIG SERVER (8888)                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          config/ (Native File System)                    │   │
│  │  ├── gateway-service.yml                                 │   │
│  │  ├── user-service.yml                                    │   │
│  │  ├── product-service.yml                                 │   │
│  │  └── order-service.yml                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    Config Pull on Startup
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
   ┌───────────┐       ┌───────────┐       ┌───────────┐
   │  Gateway  │       │   User    │       │  Product  │
   │  Service  │       │  Service  │       │  Service  │
   └───────────┘       └───────────┘       └───────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                        ┌─────┴─────┐
                        │  RabbitMQ │
                        │  Bus      │
                        └───────────┘
                              │
                    POST /actuator/busrefresh
                    (Refresh all services)
```

### Config Server Setup

```yaml
# configserver/application.yml
spring:
  application:
    name: configserver
  profiles:
    active: native
  cloud:
    config:
      server:
        native:
          search-locations: file:///path/to/config
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

server:
  port: 8888
```

### Service Configuration Import

Each microservice imports config from Config Server:

```yaml
# user/application.yml
spring:
  application:
    name: user-service
  config:
    import: optional:configserver:http://localhost:8888
```

### Configuration Files

**gateway-service.yml**
```yaml
server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: "*"
  tracing:
    sampling:
      probability: 1.0
```

**user-service.yml**
```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://user:password@cluster.mongodb.net/
      database: ecom_user
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

server:
  port: 8082

eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/

logging:
  file:
    name: logs/${spring.application.name}.log
```

**product-service.yml**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/product
    username: rthjr
    password: rthjr
  jpa:
    database: POSTGRESQL
    hibernate:
      ddl-auto: update
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

server:
  port: 8081

file:
  upload-dir: uploads
```

**order-service.yml**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/order
    username: rthjr
    password: rthjr
  jpa:
    database: POSTGRESQL
    hibernate:
      ddl-auto: update

server:
  port: 8083
```

### Dynamic Configuration Refresh

Using **Spring Cloud Bus + RabbitMQ**:

```bash
# Refresh all services
POST http://localhost:8888/actuator/busrefresh

# Refresh specific service
POST http://localhost:8888/actuator/busrefresh/user-service
```

---

## 📡 API Gateway Routes

### Route Configuration

```java
@Configuration
public class GateWayConfig {
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // Product Service Routes
            .route("product-service", r -> r
                .path("/api/products/**")
                .uri("lb://PRODUCT-SERVICE"))
            
            // User Service Routes
            .route("user-service", r -> r
                .path("/api/users/**")
                .uri("lb://USER-SERVICE"))
            
            // Auth Routes (User Service)
            .route("auth-service", r -> r
                .path("/api/auth/**")
                .uri("lb://USER-SERVICE"))
            
            // OAuth2 Routes (User Service)
            .route("oauth2-service", r -> r
                .path("/api/oauth2/**")
                .uri("lb://USER-SERVICE"))
            
            // Order & Cart Routes
            .route("order-service", r -> r
                .path("/api/orders/**", "/api/cart/**")
                .uri("lb://ORDER-SERVICE"))
            
            // Eureka Dashboard
            .route("eureka-server", r -> r
                .path("/eureka/main")
                .filters(f -> f.rewritePath("/eureka/main", "/"))
                .uri("http://localhost:8761"))
            
            .build();
    }
}
```

### Route Summary

| Path Pattern | Target Service | Description |
|--------------|----------------|-------------|
| `/api/products/**` | PRODUCT-SERVICE | Product operations |
| `/api/users/**` | USER-SERVICE | User management |
| `/api/auth/**` | USER-SERVICE | Authentication |
| `/api/oauth2/**` | USER-SERVICE | OAuth2 authentication |
| `/api/orders/**` | ORDER-SERVICE | Order management |
| `/api/cart/**` | ORDER-SERVICE | Cart operations |
| `/eureka/**` | Eureka Server | Service discovery UI |

---

## 🔧 Individual Service Details

### 1. Config Server (Port 8888)

**Purpose**: Centralized configuration management for all microservices.

**Features**:
- Native file-based configuration storage
- RabbitMQ integration for config refresh
- Environment-specific profiles support

**Endpoints**:
| Endpoint | Description |
|----------|-------------|
| `GET /{app}/{profile}` | Get config for app/profile |
| `POST /actuator/busrefresh` | Refresh all configs |

---

### 2. Eureka Server (Port 8761)

**Purpose**: Service discovery and registration.

**Features**:
- Service registry
- Health monitoring
- Load balancing support

**Configuration**:
```yaml
eureka:
  client:
    registerWithEureka: false
    fetchRegistry: false
```

---

### 3. API Gateway (Port 8080)

**Purpose**: Single entry point for all client requests.

**Features**:
- Request routing
- Load balancing (via Eureka)
- CORS handling
- Request/Response logging
- JWT validation (optional)

**Key Components**:
| Component | Description |
|-----------|-------------|
| `GateWayConfig` | Route definitions |
| `CorsConfig` | CORS configuration |
| `JwtAuthFilter` | JWT validation filter |
| `LoggingFilter` | Request logging |

---

### 4. User Service (Port 8082)

**Purpose**: User management, authentication, and authorization.

**Database**: MongoDB Atlas

**Key Features**:
- User registration & login
- JWT token management
- OAuth2 social login
- Password reset via email
- Profile management
- Address book (CRUD)
- Session management
- Account deletion (GDPR)
- Data export (GDPR)

**Controllers**:
| Controller | Base Path | Description |
|------------|-----------|-------------|
| `AuthController` | `/api/auth` | Authentication operations |
| `UserController` | `/api/users` | User CRUD & profile |
| `AddressController` | `/api/users/addresses` | Address management |
| `OAuth2Controller` | `/api/oauth2` | OAuth2 operations |

**Services**:
| Service | Description |
|---------|-------------|
| `AuthService` | Login, register, logout |
| `UserService` | User CRUD, profile updates |
| `JwtService` | JWT token operations |
| `RefreshTokenService` | Refresh token management |
| `PasswordResetService` | Password reset flow |
| `SessionService` | Session tracking |
| `AddressService` | Address CRUD |
| `AccountService` | Account deletion, data export |
| `EmailService` | Email notifications |
| `OAuth2ClientService` | OAuth2 provider integration |

**API Endpoints**:

*Authentication*
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| GET | `/api/auth/validate-reset-token` | Validate reset token |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/sessions` | Get active sessions |
| GET | `/api/auth/sessions/history` | Get login history |
| DELETE | `/api/auth/sessions/{id}` | Terminate session |
| DELETE | `/api/auth/sessions` | Terminate all other sessions |

*User Management*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (admin) |
| GET | `/api/users/{id}` | Get user by ID |
| POST | `/api/users` | Create user (admin) |
| PUT | `/api/users/{id}` | Update user (admin) |
| DELETE | `/api/users/{id}` | Delete user (admin) |
| GET | `/api/users/profile` | Get own profile |
| PUT | `/api/users/profile` | Update own profile |
| PUT | `/api/users/profile/password` | Change password |
| DELETE | `/api/users/profile` | Delete account |
| GET | `/api/users/profile/export` | Export user data |

*Address Management*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/addresses` | Get all addresses |
| GET | `/api/users/addresses/{id}` | Get address by ID |
| POST | `/api/users/addresses` | Create address |
| PUT | `/api/users/addresses/{id}` | Update address |
| DELETE | `/api/users/addresses/{id}` | Delete address |
| PUT | `/api/users/addresses/{id}/default` | Set default address |

---

### 5. Product Service (Port 8081)

**Purpose**: Product catalog management.

**Database**: PostgreSQL

**Key Features**:
- Product CRUD
- Multi-image support
- Product search & filtering
- Reviews & ratings
- FAQ management
- Seller product management
- Stock management

**Controllers**:
| Controller | Base Path | Description |
|------------|-----------|-------------|
| `ProductController` | `/api/products` | Product operations |
| `UploadController` | `/api/uploads` | File uploads |
| `MessageController` | `/api/messages` | Test messaging |

**Services**:
| Service | Description |
|---------|-------------|
| `ProductService` | Product CRUD, search, filter, reviews |

**API Endpoints**:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/{id}` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Soft delete product |
| GET | `/api/products/search?keyword=` | Search products |
| GET | `/api/products/filter` | Filter products |
| GET | `/api/products/top?limit=` | Get top-rated products |
| GET | `/api/products/owner` | Get seller's products |
| GET | `/api/products/seller/{sellerId}` | Get products by seller |
| PUT | `/api/products/{id}/reduce-stock` | Reduce stock |
| GET | `/api/products/{id}/reviews` | Get product reviews |
| POST | `/api/products/{id}/reviews` | Add review |
| GET | `/api/products/{id}/faqs` | Get product FAQs |
| POST | `/api/products/{id}/faqs` | Add FAQ |

**Filter Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| category | String | Filter by category |
| colors | List | Filter by colors |
| sizes | List | Filter by sizes |
| minPrice | BigDecimal | Minimum price |
| maxPrice | BigDecimal | Maximum price |
| sortBy | String | Sort field |
| sortDirection | String | asc/desc |
| page | int | Page number |
| size | int | Page size |

---

### 6. Order Service (Port 8083)

**Purpose**: Order and cart management.

**Database**: PostgreSQL

**Key Features**:
- Shopping cart (CRUD)
- Order creation from cart
- Stock validation & reduction
- Order history
- Payment tracking
- Delivery tracking

**Controllers**:
| Controller | Base Path | Description |
|------------|-----------|-------------|
| `OrderController` | `/api/orders` | Order operations |
| `CartController` | `/api/cart` | Cart operations |
| `MessageController` | `/api/messages` | Test messaging |

**Services**:
| Service | Description |
|---------|-------------|
| `OrderService` | Order CRUD, payment, delivery |
| `CartService` | Cart CRUD, stock validation |

**Service Clients**:
| Client | Target | Description |
|--------|--------|-------------|
| `ProductServiceClient` | Product Service | Get product, reduce stock |
| `UserServiceClient` | User Service | Validate user |

**API Endpoints**:

*Cart*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart` | Add item to cart |
| DELETE | `/api/cart/items/{productId}` | Remove item |

*Orders*
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order from cart |
| GET | `/api/orders` | Get all orders (admin) |
| GET | `/api/orders/{id}` | Get order by ID |
| GET | `/api/orders/myorders` | Get user's orders |
| PUT | `/api/orders/{id}/pay` | Mark as paid |
| PUT | `/api/orders/{id}/deliver` | Mark as delivered |

**Order Status Flow**:
```
PENDING → CONFIRMED → SHIPPED → DELIVERED
    │
    └──→ CANCELLED
```

---

## 🐳 Docker Services

```yaml
services:
  postgres:
    image: postgres:14
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: embarkx
      POSTGRES_PASSWORD: embarkx
    volumes:
      - postgres:/data/postgres

  pgadmin:
    image: dpage/pgadmin4
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: pgadmin4@pgadmin.org
      PGADMIN_DEFAULT_PASSWORD: admin

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"    # Message broker
      - "15672:15672"  # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
```

---

## 📊 Observability

### Monitoring Stack

| Tool | Purpose | Port |
|------|---------|------|
| Prometheus | Metrics collection | - |
| Grafana | Metrics visualization | - |
| Zipkin | Distributed tracing | - |
| Micrometer | Metrics bridge | - |

### Actuator Endpoints

All services expose actuator endpoints:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: "*"
  tracing:
    sampling:
      probability: 1.0
```

| Endpoint | Description |
|----------|-------------|
| `/actuator/health` | Health check |
| `/actuator/info` | Application info |
| `/actuator/metrics` | Application metrics |
| `/actuator/prometheus` | Prometheus metrics |
| `/actuator/busrefresh` | Refresh config |

### Logging

Centralized logging configuration:
```yaml
logging:
  file:
    name: logs/${spring.application.name}.log
  logback:
    rollingpolicy:
      max-file-size: 5MB
      max-history: 7
```

---

## 🚀 Service Startup Order

For proper system startup, follow this order:

```
1. Docker Services (PostgreSQL, RabbitMQ)
   ↓
2. Config Server (8888)
   ↓
3. Eureka Server (8761)
   ↓
4. User Service (8082)
   Product Service (8081)   } Can start in parallel
   Order Service (8083)
   ↓
5. API Gateway (8080)
```

### Startup Commands

```bash
# 1. Start Docker services
docker-compose up -d

# 2. Start Config Server
cd configserver && ./mvnw spring-boot:run

# 3. Start Eureka
cd eureka && ./mvnw spring-boot:run

# 4. Start microservices (in parallel)
cd user && ./mvnw spring-boot:run &
cd product && ./mvnw spring-boot:run &
cd order && ./mvnw spring-boot:run &

# 5. Start Gateway
cd gateway && ./mvnw spring-boot:run
```

---

## 📝 Technology Stack Summary

| Layer | Technology |
|-------|------------|
| **Framework** | Spring Boot 3.4.3 |
| **Language** | Java 21 |
| **Cloud** | Spring Cloud 2024.0.0 |
| **Service Discovery** | Netflix Eureka |
| **API Gateway** | Spring Cloud Gateway |
| **Configuration** | Spring Cloud Config |
| **Message Broker** | RabbitMQ |
| **Databases** | MongoDB Atlas, PostgreSQL 14 |
| **Security** | Spring Security, JWT, OAuth2 |
| **ORM** | Spring Data MongoDB, Spring Data JPA |
| **Build Tool** | Maven |
| **Monitoring** | Micrometer, Prometheus |
| **Tracing** | Zipkin, Brave |
| **Documentation** | SpringDoc OpenAPI |
| **Containerization** | Docker, Docker Compose |

---

*Last Updated: January 30, 2026*
