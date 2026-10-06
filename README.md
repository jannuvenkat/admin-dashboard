# Admin Analytics Dashboard

A modern, production-quality, full-stack **Admin Analytics Dashboard** built with **React**, **Vite**, **Tailwind CSS**, **Recharts**, **Node.js**, **Express**, and **MySQL**.

This application is built for real-world enterprise management and analytical intelligence, featuring JWT authentication, role-based authorization, parameterized SQL queries, database aggregation analytics, full CRUD operations for users and products, order lifecycle management, and dynamic charts that respond to date range filters.

---

## 1. Project Overview

The Admin Analytics Dashboard provides business executives and store administrators with live analytical insights and total operational control over an e-commerce platform. All analytics metrics, revenue figures, user growth curves, order status distributions, and product inventories are calculated on-the-fly via SQL aggregation queries from a MySQL 8.0 relational database.

### Key Capabilities

* **Live Business Intelligence**: Real-time KPI summaries including Total Revenue, Average Order Value (AOV), Order Completion Rate, and User Growth.
* **Interactive Visualizations**: Interactive Recharts components (Area charts, Line charts, Bar charts, and Donut charts).
* **Date-Range Filtering**: Switch between presets (*Today*, *7 Days*, *30 Days*, *This Month*, *This Year*, or *Custom Date Ranges*) with instantaneous data recalculation.
* **Full CRUD User Management**: Create, edit, inspect, search, paginate, and safely delete user accounts with role configuration (`admin` / `user`).
* **Catalog & Inventory Control**: Manage product listings with categories, real-time stock levels, and low-stock inventory warnings.
* **Order Lifecycle & Fulfillments**: Filter orders by status or date range, update statuses (`pending`, `processing`, `completed`, `cancelled`), and inspect line items with pricing subtotals and payment records.
* **Role-Based Security**: Protected admin-only routes with JWT authorization, bcrypt password hashing, and token verification.

---

## 2. Technology Stack

### Frontend
* **Core Framework**: React.js 18 with Vite
* **Routing**: React Router DOM (v6)
* **Styling**: Tailwind CSS with custom color system
* **Charts & Analytics**: Recharts
* **Icons**: Lucide React
* **HTTP Client**: Axios with automatic request interceptors and error handling

### Backend
* **Runtime**: Node.js (v20+)
* **Framework**: Express.js (REST API architecture)
* **Database Driver**: `mysql2/promise` (connection pooling with parameterized queries)
* **Authentication**: JSON Web Tokens (`jsonwebtoken`)
* **Security & Encryption**: `bcryptjs` for salted password hashing
* **CORS & Environment**: `cors` and `dotenv`
* **Architecture Pattern**: Controller-Service-Model Layered Architecture

### Database
* **Database Engine**: MySQL 8.0
* **Storage Engine**: InnoDB
* **Collation**: `utf8mb4_unicode_ci`

---

## 3. Architecture & Data Flow

The project strictly adheres to a clean separation of concerns:

```text
React Component
      ↓
Axios Service (services/api.js)
      ↓
Express Route (routes/*Routes.js)
      ↓
Middleware (authMiddleware.js, adminMiddleware.js, validationMiddleware.js)
      ↓
Controller (controllers/*Controller.js)
      ↓
Service (services/*Service.js)
      ↓
Model (models/*Model.js)
      ↓
MySQL Connection Pool (config/db.js)
```

1. **React UI**: Components capture user interaction and trigger service calls.
2. **Axios Client**: Attaches the JWT Bearer token via interceptors and points to backend endpoints.
3. **Express Routing & Middleware**: Validates JWT authenticity and enforces `role === 'admin'`.
4. **Controllers**: Parse input, format HTTP responses, and delegate logic to services.
5. **Services**: Execute domain business logic, percentage comparisons, and data transformations.
6. **Models**: Issue secure, parameterized SQL queries to MySQL via `mysql2/promise`.

---

## 4. Folder Structure

```text
admin-analytics-dashboard/
│
├── database/
│   ├── schema.sql              # Database schema definitions with indexes & constraints
│   └── seed.sql                # Realistic seed dataset spanning several months
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # MySQL connection pool
│   │   ├── controllers/        # Request & response controllers
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── userController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   └── analyticsController.js
│   │   ├── routes/             # REST route declarations
│   │   │   ├── authRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── analyticsRoutes.js
│   │   ├── services/           # Business logic & KPI aggregations
│   │   │   ├── dashboardService.js
│   │   │   ├── userService.js
│   │   │   ├── productService.js
│   │   │   ├── orderService.js
│   │   │   └── analyticsService.js
│   │   ├── models/             # Direct SQL queries & database operations
│   │   │   ├── userModel.js
│   │   │   ├── productModel.js
│   │   │   ├── orderModel.js
│   │   │   └── categoryModel.js
│   │   ├── middleware/         # Auth, admin, validation & error handling
│   │   │   ├── authMiddleware.js
│   │   │   ├── adminMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── validationMiddleware.js
│   │   ├── utils/
│   │   │   └── generateToken.js# JWT signature helper
│   │   ├── scripts/
│   │   │   └── seed.js         # Node database seeder runner
│   │   └── server.js           # Express application entry point
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Reusable UI widgets
│   │   │   ├── Sidebar.jsx     # Modern responsive navigation drawer
│   │   │   ├── Navbar.jsx      # Top status bar & user profile
│   │   │   ├── StatCard.jsx    # Metric card with trend percentage
│   │   │   ├── ChartCard.jsx   # Card wrapper for Recharts
│   │   │   ├── DataTable.jsx   # Paginated, sortable, searchable data table
│   │   │   ├── Modal.jsx       # Accessible modal dialog
│   │   │   ├── Loading.jsx     # Skeletons and spinners
│   │   │   └── ErrorMessage.jsx# Dismissible & retryable alert banner
│   │   ├── pages/              # View pages
│   │   │   ├── Login.jsx       # Authentication page with demo quick-fill
│   │   │   ├── Dashboard.jsx   # Executive overview (8 StatCards + 5 charts)
│   │   │   ├── Users.jsx       # Users CRUD & role filtering
│   │   │   ├── Products.jsx    # Catalog & inventory management
│   │   │   ├── Orders.jsx      # Order lifecycle & line item details
│   │   │   ├── Analytics.jsx   # Dedicated deep analytics with date presets
│   │   │   └── Settings.jsx    # Environment, profile & database status
│   │   ├── layouts/
│   │   │   └── AdminLayout.jsx # Master layout wrapper
│   │   ├── services/           # Axios API service integrations
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication state provider
│   │   ├── hooks/
│   │   │   └── useAuth.js      # Auth context hook
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx   # React Router route declarations
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── README.md
├── .gitignore
└── package.json
```

---

## 5. Database Schema & Design

Database Name: `admin_dashboard`

### Entity Relationship Diagram

```text
users (id, name, email, password, role, created_at, updated_at)
  │
  │ 1:N
  ▼
orders (id, user_id, total_amount, status, created_at, updated_at)
  │
  ├── 1:N ──► payments (id, order_id, amount, payment_method, payment_status, created_at)
  │
  └── 1:N ──► order_items (id, order_id, product_id, quantity, price)
                    │
                    │ N:1
                    ▼
              products (id, name, category_id, price, stock, status, created_at, updated_at)
                    │
                    │ N:1
                    ▼
              categories (id, name, created_at)
```

### Table Definitions

1. **`users`**:
   * `id` INT AUTO_INCREMENT PRIMARY KEY
   * `name` VARCHAR(100) NOT NULL
   * `email` VARCHAR(150) NOT NULL UNIQUE
   * `password` VARCHAR(255) NOT NULL (bcrypt salted hash)
   * `role` ENUM('admin', 'user') DEFAULT 'user'
   * `created_at`, `updated_at` TIMESTAMP

2. **`categories`**:
   * `id` INT AUTO_INCREMENT PRIMARY KEY
   * `name` VARCHAR(100) NOT NULL UNIQUE
   * `created_at` TIMESTAMP

3. **`products`**:
   * `id` INT AUTO_INCREMENT PRIMARY KEY
   * `name` VARCHAR(150) NOT NULL
   * `category_id` INT (FK -> `categories.id` ON DELETE CASCADE)
   * `price` DECIMAL(10, 2) NOT NULL
   * `stock` INT DEFAULT 0
   * `status` ENUM('active', 'inactive') DEFAULT 'active'
   * `created_at`, `updated_at` TIMESTAMP

4. **`orders`**:
   * `id` INT AUTO_INCREMENT PRIMARY KEY
   * `user_id` INT (FK -> `users.id` ON DELETE CASCADE)
   * `total_amount` DECIMAL(10, 2) NOT NULL
   * `status` ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending'
   * `created_at`, `updated_at` TIMESTAMP

5. **`order_items`**:
   * `id` INT AUTO_INCREMENT PRIMARY KEY
   * `order_id` INT (FK -> `orders.id` ON DELETE CASCADE)
   * `product_id` INT (FK -> `products.id` ON DELETE CASCADE)
   * `quantity` INT NOT NULL
   * `price` DECIMAL(10, 2) NOT NULL

6. **`payments`**:
   * `id` INT AUTO_INCREMENT PRIMARY KEY
   * `order_id` INT (FK -> `orders.id` ON DELETE CASCADE)
   * `amount` DECIMAL(10, 2) NOT NULL
   * `payment_method` VARCHAR(50) NOT NULL
   * `payment_status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending'
   * `created_at` TIMESTAMP

---

## 6. Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=admin_dashboard
JWT_SECRET=super_secret_jwt_key_admin_dashboard_2026_secure
JWT_EXPIRES_IN=7d
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 7. Installation & Setup Instructions

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **MySQL Server**: 8.0 or higher running on port 3306

### Step 1: Clone or Navigate to the Project
```bash
cd admin-analytics-dashboard
```

### Step 2: Install Dependencies
Install dependencies for both backend and frontend:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install

cd ..
```

### Step 3: Configure Database & Run Migrations

Ensure your MySQL server is running. Update your MySQL credentials in `backend/.env`.

Then execute the database initialization and seed command:

```bash
cd backend
npm run seed
```

This will automatically create the `admin_dashboard` database, apply `database/schema.sql`, and populate realistic records from `database/seed.sql`.

Alternatively, you can import using the MySQL CLI:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

---

## 8. Running the Application

### Running the Backend Server
```bash
cd backend
npm run dev
```
* Backend API starts on: **`http://localhost:5000`**
* Health check: **`http://localhost:5000/api/health`**

### Running the Frontend Application
In a separate terminal:
```bash
cd frontend
npm run dev
```
* Frontend application starts on: **`http://localhost:5173`**

### Building for Production
```bash
cd frontend
npm run build
```

---

## 9. Development Admin Login Credentials

| Attribute | Value |
| :--- | :--- |
| **Email** | `admin@example.com` |
| **Password** | `Admin@12345` |
| **Role** | `admin` |
| **Dashboard URL** | `http://localhost:5173/login` |

*Note: The login page includes a convenient "Auto-fill Admin Credentials" button for rapid evaluation.*

---

## 10. REST API Documentation

All administrative endpoints require the `Authorization: Bearer <token>` header.

### Authentication
* `POST /api/auth/login` - Authenticate admin & issue JWT
* `GET  /api/auth/me` - Retrieve current session user profile
* `POST /api/auth/logout` - Invalidate session

### Dashboard
* `GET /api/dashboard/stats` - Summary KPI metrics (totalUsers, totalProducts, totalOrders, totalRevenue, todayRevenue, todayOrders, newUsers, pendingOrders, recentOrders)

### Analytics
* `GET /api/analytics/revenue?startDate=&endDate=` - Revenue totals, daily & monthly breakdowns, growth percentage
* `GET /api/analytics/users?startDate=&endDate=` - User registration totals, daily acquisitions, growth rate
* `GET /api/analytics/orders?startDate=&endDate=` - Order status counts, daily volume, AOV, completion rate
* `GET /api/analytics/products` - Top 10 selling products, low-stock watchlist, revenue by category

### Users Management
* `GET    /api/users?page=1&limit=10&search=&role=&sortBy=&sortOrder=` - Paginated users
* `GET    /api/users/:id` - User profile details
* `POST   /api/users` - Create user
* `PUT    /api/users/:id` - Update user details & role
* `DELETE /api/users/:id` - Delete user account

### Products Catalog
* `GET    /api/products?page=1&limit=10&search=&category=&stock=&status=&sortBy=&sortOrder=` - Paginated products
* `GET    /api/products/categories` - Fetch all categories
* `GET    /api/products/:id` - Product details
* `POST   /api/products` - Create new product
* `PUT    /api/products/:id` - Update existing product
* `DELETE /api/products/:id` - Delete product

### Orders Management
* `GET /api/orders?page=1&limit=10&search=&status=&startDate=&endDate=&sortBy=&sortOrder=` - Paginated orders
* `GET /api/orders/:id` - Order details with customer information, line items, and payment breakdown
* `PUT /api/orders/:id/status` - Update order fulfillment status (`pending`, `processing`, `completed`, `cancelled`)

---

## 11. Screenshots Section

| Screen | Description |
| :--- | :--- |
| **Login** | Clean SaaS authentication interface with password visibility toggle and demo auto-fill |
| **Executive Dashboard** | 8 StatCards, Revenue Area Chart, User Growth Line Chart, Orders Bar Chart, Status Donut Chart, Top Products, and Recent Transactions |
| **Users Management** | Searchable, paginated user table with role filter badges, Add/Edit modals, and deletion confirmation dialogs |
| **Products Catalog** | Inventory table with category filter, stock level filter, low-stock alerts, and Add/Edit modals |
| **Orders Management** | Order management with status badges, date filtering, item inspection modal, and status updates |
| **Dedicated Analytics** | Business intelligence dashboard with date range presets (*Today*, *7 Days*, *30 Days*, *This Month*, *This Year*, *Custom*) and KPI cards |
| **Settings** | Admin account overview, database connection status, and security parameters |

---

## 12. Future Improvements

* Export analytics data to CSV / Excel and PDF reports.
* Dark / Light mode theme switcher.
* Webhook / WebSocket integration for real-time live order notifications.
* Multi-factor authentication (MFA / 2FA) using TOTP.
* Role-based granular permissions (Manager, Support, Super Admin).
