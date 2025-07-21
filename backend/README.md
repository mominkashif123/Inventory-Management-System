# Inventory Management System - Backend

This is the backend server for the Inventory Management System, configured to work with Supabase PostgreSQL database.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory with your Supabase credentials and JWT secret:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# JWT Secret (required for authentication)
JWT_SECRET=your_super_secret_key_here
```

### 3. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL**: Use this as `SUPABASE_URL`
   - **anon public**: Use this as `SUPABASE_ANON_KEY`
   - **service_role secret**: Use this as `SUPABASE_SERVICE_ROLE_KEY`

### 4. Database Tables

Make sure you have the following tables in your Supabase database (or modify the code to match your table names):

```sql
-- Example products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Run the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /` - API information
- `GET /health` - Health check endpoint

### Database Test
- `GET /api/test-db` - Test database connection

### Products (Example)
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product

## Project Structure

```
backend/
├── config/
│   └── database.js      # Supabase configuration
├── controllers/         # Route controllers
├── models/             # Data models
├── routes/             # API routes
├── .env                # Environment variables
├── package.json        # Dependencies
├── server.js           # Main server file
└── README.md           # This file
```

## Features

- ✅ Express.js server setup
- ✅ Supabase PostgreSQL integration
- ✅ CORS configuration for frontend
- ✅ Security middleware (Helmet)
- ✅ Request logging (Morgan)
- ✅ Environment variable management
- ✅ Error handling
- ✅ Database connection testing
- ✅ Example API routes

## Troubleshooting

1. **Database Connection Error**: Check your `.env` file and ensure Supabase credentials are correct
2. **CORS Error**: Verify the `CORS_ORIGIN` in your `.env` file matches your frontend URL
3. **Table Not Found**: Update the table names in the API routes to match your Supabase schema

## Next Steps

1. Create your database tables in Supabase
2. Update the API routes to match your table structure
3. Add authentication middleware if needed
4. Implement your specific business logic
5. Add input validation and sanitization 