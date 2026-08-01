# Eagle Beer Shop Backend

Node.js + Express + MySQL

## Setup Steps

1. `cd backend`
2. Copy `.env.example` to `.env` and set DB/JWT variables
3. Import `schema.sql` to MySQL
4. If using old schema: `ALTER TABLE users ADD COLUMN name VARCHAR(255) NULL AFTER email;`
5. `npm install`
6. `npm run dev`

## API Routes Summary

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| GET | `/api/auth/verify` | Verify JWT token |
| GET | `/api/products` | List all products |
| GET | `/api/orders` | List orders (auth) |
| POST | `/api/orders` | Create order (auth) |
| GET | `/api/feedback` | List feedback |
| POST | `/api/feedback` | Submit feedback (auth) |
| GET | `/api/admin/stats` | Admin dashboard stats (admin) |
| GET | `/api/admin/users` | List all users (admin) |

## Notes

In PowerShell, run npm commands with `.cmd` suffix:
- `npm.cmd install`
- `npm.cmd run dev`
