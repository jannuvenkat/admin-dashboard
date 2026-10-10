# Admin Analytics Dashboard - Python FastAPI Backend

This directory contains the production-quality Python backend migrated from the original Node.js / Express backend.

## Technology Stack

- **Python 3.12**
- **FastAPI 0.115.0** (High-performance ASGI framework)
- **Uvicorn** (Lightning-fast ASGI server)
- **MySQL 8.0**
- **aiomysql** (Asynchronous connection pooling and queries)
- **Pydantic v2** (Request validation and serialization)
- **PyJWT** (HMAC-SHA256 JWT tokens)
- **bcrypt** (Password hash verification and generation)
- **openpyxl** (High-fidelity Excel export generation)

## Directory Structure

```text
python-backend/
├── app/
│   ├── main.py                     # FastAPI app setup, CORS, lifespan, routes
│   ├── core/
│   │   ├── config.py               # Environment configuration
│   │   └── security.py             # JWT token handling & bcrypt verification
│   ├── database/
│   │   └── connection.py           # aiomysql async pool & query execution
│   ├── schemas/
│   │   ├── common.py               # Standard response envelopes & pagination
│   │   ├── auth.py                 # Login & token schemas
│   │   ├── users.py                # User request schemas
│   │   ├── products.py             # Product request schemas
│   │   └── orders.py               # Order request schemas
│   ├── models/
│   │   ├── user_model.py           # User SQL queries
│   │   ├── category_model.py       # Category SQL queries
│   │   ├── product_model.py        # Product SQL queries
│   │   └── order_model.py          # Order SQL queries
│   ├── services/
│   │   ├── auth_service.py         # Login logic
│   │   ├── dashboard_service.py    # Executive KPI aggregations
│   │   ├── user_service.py         # User management
│   │   ├── product_service.py      # Product catalog management
│   │   ├── order_service.py        # Order management & exports
│   │   ├── analytics_service.py    # Revenue, user, order, product analytics
│   │   └── excel_service.py        # openpyxl formatted spreadsheet generator
│   ├── middleware/
│   │   └── auth_middleware.py      # JWT Bearer token & Admin role validation
│   └── routers/
│       ├── auth.py                 # /api/auth
│       ├── dashboard.py            # /api/dashboard
│       ├── users.py                # /api/users
│       ├── products.py             # /api/products
│       ├── orders.py               # /api/orders
│       └── analytics.py            # /api/analytics
├── requirements.txt
├── .env.example
├── .env
└── README.md
```

## Running the Server

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Ensure `.env` contains your MySQL database credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=2004
DB_NAME=admin_dashboard
JWT_SECRET=super_secret_jwt_key_admin_dashboard_2026_secure
JWT_EXPIRES_IN=7d
```

### 3. Start the Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```
or
```bash
python -m uvicorn app.main:app --port 5000 --reload
```

## API Endpoints

- `GET  /api/health` - API health check
- `POST /api/auth/login` - Administrator login
- `GET  /api/auth/me` - Authenticated admin profile
- `POST /api/auth/logout` - Logout session
- `GET  /api/dashboard/stats` - Summary cards, revenue metrics, recent orders
- `GET  /api/analytics/revenue` - Revenue metrics, daily/weekly/monthly breakdown
- `GET  /api/analytics/users` - User registration metrics and timeline
- `GET  /api/analytics/orders` - Order volume, status distribution, AOV
- `GET  /api/analytics/products` - Top selling products, low stock alerts, revenue by category
- `GET  /api/users` - Paginated user list with search, role filters, sorting
- `GET  /api/users/{id}` - Single user details
- `POST /api/users` - Create user
- `PUT  /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `GET  /api/products` - Paginated product catalog
- `GET  /api/products/categories` - Product categories list
- `GET  /api/products/{id}` - Product details
- `POST /api/products` - Create product
- `PUT  /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET  /api/orders` - Paginated orders with filtering & sorting
- `GET  /api/orders/export` - Professional Excel export (`.xlsx`) respecting active filters
- `GET  /api/orders/{id}` - Order details with items
- `PUT  /api/orders/{id}/status` - Update order status
