# Admin Frontend (Vite + React + TS)

Scaffolded admin frontend for 'platform' project.
Includes:
- React + TypeScript
- Redux Toolkit auth slice (email -> OTP)
- axios instance configured with withCredentials
- Theme CSS provided by designer (theme.css)

How to run locally:
1. Install deps:
   npm ci
2. Start dev server:
   npm run dev

How to build & serve:
1. npm run build
2. serve or Dockerfile provided in project root.

Configure API URL:
- copy .env.example -> .env and set VITE_API_URL

Docker:
- docker build -t admin-frontend .
- docker run -p 3000:80 admin-frontend

