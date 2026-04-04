---
name: nodejs-backend
description: "Use when: implementing, refactoring, or debugging Node.js Express + Sequelize backend code in this repository; adding API endpoints (route/controller/service/model), migrations, validation, and tests."
---

# Node.js Backend Skill (E-commerce Clothing BE)

## Purpose
Use this skill to make safe, consistent backend changes in this repository.

## Stack And Conventions
- Runtime/module system: Node.js + CommonJS (`require`, `module.exports`).
- Web framework: Express.
- ORM/database: Sequelize + MySQL.
- Validation: `express-validator` (centralized in `src/validations/index.js`).
- Testing: Jest + Supertest (`npm test`).

## Architecture Pattern
Follow this flow for business endpoints:
1. Route in `src/routes/*.route.js`
2. Controller in `src/controllers/*.controller.js`
3. Service in `src/services/*.service.js`
4. Sequelize model/migration when schema changes are needed

Controller responsibilities:
- Read `req` input.
- Call service.
- Return JSON response.
- Pass errors with `next(error)`.

Service responsibilities:
- Business logic and data access.
- Throw `Error` with `error.status` for expected API failures (400/404/etc.).

## API Response Shape
Keep response payloads consistent with current code:
- Success usually includes: `success: true`, and `data` and/or `message`.
- Failures are handled by `src/middlewares/error.middleware.js` and return:
  - `success: false`
  - `message`
  - `stack` (non-production)

## Required Checks Before Editing
1. Confirm imports exist before wiring routes/controllers.
2. Check `src/routes/index.js` for currently enabled modules.
3. If adding a new module, register it in router index and ensure file paths are real.
4. If touching DB entities, verify model associations and migration compatibility.
5. Do not switch the project to ESM/TypeScript unless explicitly requested.

## Current Repository Caveats (Verify-First)
These paths are referenced but currently missing in this workspace state:
- `src/middlewares/auth.middleware.js`
- `src/routes/user.route.js`
- `src/utils/pagination.js`
- `src/docs/swagger.js`

When your task depends on these modules:
- Either create them intentionally as part of the task, or
- Adjust imports/usage to existing modules, and explain the decision.

## Endpoint Implementation Checklist
Use the checklist asset before finalizing backend features:
- `assets/endpoint-checklist.md`

## Verification Commands
Run relevant commands after changes:
- `npm test`
- `npm run dev` (for local runtime sanity)
- `npx sequelize-cli db:migrate` (when adding/changing migrations)
