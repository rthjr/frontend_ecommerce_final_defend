# E-Commerce Frontend - Complete Application Summary

## 📋 Overview

This is a full-stack e-commerce platform built with **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS**, and **Redux Toolkit**. The application supports multiple user roles with distinct features and workflows.

---

## 👥 User Roles

The application supports **3 main roles**:

| Role | Description | Access Level |
|------|-------------|--------------|
| **Guest** | Unauthenticated visitors | Browse products, view details, add to cart (local storage) |
| **ROLE_CUSTOMER** | Registered customers | All guest features + checkout, order history, profile management |
| **ROLE_USER** | Sellers/Vendors | All customer features + product management (create, edit, delete own products) |
| **ROLE_ADMIN** | Administrators | Full system access - manage all products, orders, users, analytics |

### Role Hierarchy
```
ROLE_ADMIN > ROLE_USER > ROLE_CUSTOMER > Guest
```

---

## 📁 Page Structure

### Authentication Pages (`/src/app/(auth)/`)

| Route | Page | Description | Access |
|-------|------|-------------|--------|
| `/login` | Login Page | Email/password login + OAuth2 (Google, GitHub, Facebook) | Guest only |
| `/register` | Register Page | User registration with name, email, password | Guest only |
| `/forgot-password` | Forgot Password | Request password reset email | Guest only |
| `/reset-password` | Reset Password | Reset password with token from email | Guest only |

### Main Public Pages (`/src/app/(main)/`)

| Route | Page | Description | Access |
|-------|------|-------------|--------|
| `/` | Home Page | Hero banner, featured products, categories, new arrivals, newsletter | Public |
| `/products` | Products List | Browse all products with search, filter, sort | Public |
| `/products/[id]` | Product Detail | Product info, images, reviews, add to cart | Public |
| `/products/search` | Search Page | Advanced product search | Public |
| `/cart` | Shopping Cart | View/edit cart items, price summary | Public |
| `/checkout` | Checkout | Multi-step checkout (shipping → payment → review) | Authenticated |
| `/checkout/success` | Order Success | Order confirmation page | Authenticated |
| `/checkout/error` | Checkout Error | Payment/order error handling | Authenticated |
| `/orders` | My Orders | List of user's orders | Authenticated |
| `/orders/[id]` | Order Detail | Detailed order view with status | Authenticated |
| `/profile` | Profile Page | View/edit profile, change password | Authenticated |
| `/profile/addresses` | Address Book | Manage shipping addresses (CRUD) | Authenticated |
| `/profile/orders` | Order History | Alternative order history view | Authenticated |

### Seller/User Pages (`/src/app/(user)/`)

| Route | Page | Description | Access |
|-------|------|-------------|--------|
| `/my-products` | My Products | List seller's own products | ROLE_USER, ROLE_ADMIN |
| `/my-products/add` | Add Product | Create new product listing | ROLE_USER, ROLE_ADMIN |
| `/my-products/edit/[id]` | Edit Product | Edit existing product | ROLE_USER, ROLE_ADMIN |
| `/settings` | User Settings | Profile, notifications, security, sessions, account actions | ROLE_USER, ROLE_ADMIN |

### Admin Pages (`/src/app/(admin)/admin/`)

| Route | Page | Description | Access |
|-------|------|-------------|--------|
| `/admin` | Dashboard | Overview stats (revenue, orders, products, users) | ROLE_ADMIN |
| `/admin/products` | Product Management | CRUD all products, bulk operations | ROLE_ADMIN |
| `/admin/products/new` | Create Product | Add new product (admin) | ROLE_ADMIN |
| `/admin/products/[id]` | Edit Product | Edit any product | ROLE_ADMIN |
| `/admin/orders` | Order Management | View/manage all orders, mark delivered | ROLE_ADMIN |
| `/admin/orders/[id]` | Order Detail | Detailed order management | ROLE_ADMIN |
| `/admin/users` | User Management | CRUD users, assign roles | ROLE_ADMIN |
| `/admin/users/[id]` | User Detail | Edit user details | ROLE_ADMIN |
| `/admin/analytics` | Analytics | Sales charts, reports | ROLE_ADMIN |
| `/admin/settings` | Admin Settings | System configuration | ROLE_ADMIN |

### Other Pages

| Route | Page | Description |
|-------|------|-------------|
| `/unauthorized` | Unauthorized | Access denied page for restricted routes |

---

## 🔧 Features by Category

### 1. Authentication & Security
- ✅ Email/Password login & registration
- ✅ OAuth2 login (Google, GitHub, Facebook)
- ✅ JWT token management with auto-refresh
- ✅ Password reset via email
- ✅ Session management (view active sessions, terminate sessions)
- ✅ Login history tracking
- ✅ Role-based access control (RBAC)
- ✅ Protected routes with role verification

### 2. Product Management
- ✅ Product listing with pagination
- ✅ Advanced search with filters (category, price range, rating)
- ✅ Sort options (name, price low/high, rating)
- ✅ Grid/List view toggle
- ✅ Product detail with images gallery
- ✅ Product reviews and ratings
- ✅ Seller product management (CRUD)
- ✅ Image upload to Cloudinary
- ✅ Active/Inactive product status
- ✅ Stock management

### 3. Shopping Cart
- ✅ Add/remove products
- ✅ Update quantities
- ✅ Color/size variant selection
- ✅ Local cart for guests (localStorage)
- ✅ Server cart sync for authenticated users
- ✅ Cart drawer (slide-out panel)
- ✅ Cart page with full details
- ✅ Price calculation (subtotal, tax, shipping)

### 4. Checkout & Orders
- ✅ Multi-step checkout flow
- ✅ Shipping address form
- ✅ Multiple payment methods (Cash on Delivery, PayPal, KHQR)
- ✅ Order summary review
- ✅ Order placement
- ✅ Order confirmation
- ✅ Order history
- ✅ Order detail view
- ✅ Order status tracking

### 5. User Profile
- ✅ View profile information
- ✅ Edit profile (name, phone)
- ✅ Change password
- ✅ Address book management
- ✅ Set default address
- ✅ Data export (GDPR compliance)
- ✅ Account deletion with confirmation

### 6. Admin Features
- ✅ Dashboard with KPIs
- ✅ Revenue tracking
- ✅ Order statistics
- ✅ User management (CRUD)
- ✅ Product management (CRUD)
- ✅ Bulk operations (delete, mark delivered)
- ✅ Export data (CSV)
- ✅ Analytics charts

### 7. UI/UX Features
- ✅ Responsive design (mobile-first)
- ✅ Dark/Light mode support
- ✅ Loading skeletons
- ✅ Toast notifications (Sonner)
- ✅ Form validation
- ✅ Error handling
- ✅ Empty states
- ✅ Smooth animations (Framer Motion)

---

## 🔄 User Flow Processes

### Flow 1: Guest Shopping Flow
```
1. Visit Home Page (/)
   ↓
2. Browse Products (/products)
   ↓
3. View Product Detail (/products/[id])
   ↓
4. Add to Cart (stored in localStorage)
   ↓
5. View Cart (/cart)
   ↓
6. Proceed to Checkout → Redirected to Login
   ↓
7. Login (/login) or Register (/register)
   ↓
8. Cart syncs to server
   ↓
9. Complete Checkout (/checkout)
   ↓
10. Order Confirmation (/checkout/success)
```

### Flow 2: Customer Order Flow
```
1. Login (/login)
   ↓
2. Browse & Add Products to Cart
   ↓
3. Go to Cart (/cart)
   ↓
4. Checkout (/checkout)
   ├── Step 1: Enter Shipping Address
   ├── Step 2: Select Payment Method
   └── Step 3: Review & Place Order
   ↓
5. Order Created → Success Page
   ↓
6. View Orders (/orders)
   ↓
7. Track Order Status (/orders/[id])
```

### Flow 3: Seller Product Management
```
1. Login with ROLE_USER account
   ↓
2. Navigate to My Products (/my-products)
   ↓
3. Click "Add Product" (/my-products/add)
   ├── Fill product details
   ├── Upload images to Cloudinary
   └── Set price, stock, category
   ↓
4. Product created (status: active/inactive)
   ↓
5. Edit Product (/my-products/edit/[id])
   ↓
6. Manage inventory & pricing
```

### Flow 4: Admin Workflow
```
1. Login with ROLE_ADMIN account
   ↓
2. View Dashboard (/admin)
   ├── Total Revenue
   ├── Order Count
   ├── Product Count
   └── User Count
   ↓
3. Manage Orders (/admin/orders)
   ├── View all orders
   ├── Mark as delivered
   └── Bulk operations
   ↓
4. Manage Products (/admin/products)
   ├── View all products
   ├── Edit any product
   ├── Delete products
   └── Bulk delete
   ↓
5. Manage Users (/admin/users)
   ├── View all users
   ├── Create new user
   ├── Edit user roles
   └── Delete users
```

### Flow 5: Password Reset
```
1. Click "Forgot Password" on login page
   ↓
2. Enter email (/forgot-password)
   ↓
3. Receive email with reset link
   ↓
4. Click link → Reset Password page (/reset-password?token=xxx)
   ↓
5. Enter new password
   ↓
6. Password updated → Redirect to login
```

### Flow 6: Profile & Settings Management
```
1. Login
   ↓
2. Click Profile icon → Profile Page (/profile)
   ├── View profile info
   ├── Edit profile
   └── Change password
   ↓
3. Manage Addresses (/profile/addresses)
   ├── Add new address
   ├── Edit address
   ├── Delete address
   └── Set default address
   ↓
4. Settings (/settings) - For ROLE_USER
   ├── Profile settings
   ├── Security (password, 2FA placeholder)
   ├── Session management
   │   ├── View active sessions
   │   ├── View login history
   │   └── Terminate sessions
   └── Account actions
       ├── Export data
       └── Delete account
```

---

## 📊 Page Count Summary

| Category | Count |
|----------|-------|
| Authentication Pages | 4 |
| Main/Public Pages | 12 |
| User/Seller Pages | 4 |
| Admin Pages | 10 |
| Other Pages | 1 |
| **Total Pages** | **31** |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI)
- **State Management**: Redux Toolkit + RTK Query
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend Integration
- **API Client**: Custom fetch wrapper with interceptors
- **Authentication**: JWT with refresh tokens
- **File Upload**: Cloudinary
- **Gateway**: Spring Cloud Gateway (port 8080)

### Services (Microservices Architecture)
- **User Service**: Authentication, profiles, addresses
- **Product Service**: Products, categories, reviews
- **Order Service**: Orders, cart, payments

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Description |
|------------|-------|-------------|
| Mobile | < 640px | Single column layout |
| Tablet | 640px - 1024px | Two column layouts |
| Desktop | > 1024px | Full layout with sidebar |

---

## 🔐 Security Features

1. **JWT Authentication**
   - Access token (short-lived)
   - Refresh token (long-lived)
   - Auto-refresh on expiry

2. **Route Protection**
   - Client-side guards
   - Role-based access
   - Redirect to login/unauthorized

3. **Session Management**
   - Track active sessions
   - Device information
   - IP address logging
   - Manual session termination

4. **Data Privacy**
   - GDPR-compliant data export
   - Account deletion with confirmation
   - Password verification for sensitive actions

---

## 📝 Notes

1. **Cart Behavior**:
   - Guests: Cart stored in localStorage
   - Authenticated: Cart synced to backend
   - On login: Local cart syncs to server

2. **Image Handling**:
   - Product images uploaded to Cloudinary
   - Fallback placeholder for missing images
   - Next.js Image optimization

3. **Role Assignment**:
   - New registrations get `ROLE_CUSTOMER`
   - `ROLE_USER` (seller) assigned by admin
   - `ROLE_ADMIN` assigned by admin only

4. **Checkout Requirements**:
   - Must be authenticated
   - Must have items in cart
   - Must provide shipping address
   - Must select payment method

---

*Last Updated: January 30, 2026*
