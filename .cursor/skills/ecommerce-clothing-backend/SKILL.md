---
name: ecommerce-clothing-backend
description: >-
  Guides implementation and changes for the E-commerce Clothing Node.js REST API
  (Express 5, Sequelize, MySQL, JWT, Cloudinary, Swagger). Use when editing this
  repository, adding routes/controllers/services/models, database migrations,
  auth flows, payments, cart/orders, or running tests and local dev for this backend.
---

# E-commerce Clothing Backend (Node.js)

## Stack

- **Runtime**: Node.js (CommonJS), entry `src/server.js`
- **HTTP**: Express 5 (`src/app.js`)
- **DB**: MySQL via Sequelize (`src/config/sequelize.js`, `src/config/database.js`)
- **Auth**: JWT (`jsonwebtoken`), bcrypt (`bcryptjs`), optional Google (`google-auth-library`)
- **Uploads**: Multer + Cloudinary (`src/middlewares/upload.middleware.js`)
- **API docs**: Swagger UI at `/api-docs` when `src/docs/swagger` is present
- **Tests**: Jest + Supertest; tests live under `**/tests/**/*.test.js`

## Layout (follow it)

| Layer | Path | Role |
|--------|------|------|
| Routes | `src/routes/*.route.js` | Mount paths, wire to controllers |
| Controllers | `src/controllers/**/*.js` | HTTP: parse request, call service, send response |
| Services | `src/services/**/*.js` | Business logic, DB calls via models |
| Models | `src/models/*.js` | Sequelize models; export from `src/models/index.js` if needed |
| Middlewares | `src/middlewares/*.js` | Errors, uploads, auth |
| Validations | `src/validations/` | Shared validation helpers |
| Migrations | `src/migrations/` | `npx sequelize-cli db:migrate` |

Admin-specific code uses `src/routes/admin/`, `src/controllers/admin/`, `src/services/admin/`.

## Conventions

- **Extend existing files** for new behavior; match naming (`*.route.js`, `*.controller.js`, `*.service.js`).
- **Register routes** in `src/routes/index.js` with `router.use('/segment', require('./feature.route'))`.
- **Errors**: rely on `src/middlewares/error.middleware.js` (`notFound`, `errorHandler`).
- **Env**: load via `dotenv`; never commit secrets. See `.env.example` / README for `PORT`, `DB_*`, `JWT_*`, `FRONT_END_URL`, SMTP, Cloudinary, Google.
- **API base path**: `/api/v1` (see `src/app.js`).

## Commands

```bash
npm install
npm run dev          # nodemon
npm start            # production
npm test             # jest --coverage
npx sequelize-cli db:migrate
```

## Project workflow (repo rules)

- Prefer plans under `./plans` for non-trivial work; align with `./docs` standards when those files exist.
- After code changes, run `npm test` and fix real failures (no fake passes).
- Keep files focused; split when a file grows hard to maintain.

## When touching routes

- Confirm the route file exists and is `require`d from `src/routes/index.js`.
- Some product/cart/order modules may exist on disk while the router only mounts a subset; uncomment or add `router.use` when enabling features.

## Additional map

For a fuller file map and known gaps, see [reference.md](reference.md).
