# Reference: paths and domains

## Active route modules (files on disk)

- `health.route.js`, `auth.route.js`, `product.route.js`, `category.route.js`, `color.route.js`, `size.route.js`, `material.route.js`, `cart.route.js`, `order.route.js`, `payment.route.js`, `notification.route.js`
- Admin: `admin/user.route.js`

## `src/routes/index.js` behavior

The index file may only mount a subset of routes (e.g. health, auth, users, admin users). Other `*.route.js` files exist for catalog, cart, orders, etc.; enable them by adding `router.use(...)` when ready.

## App bootstrap

- `src/server.js` — listens after DB sync/init as implemented there.
- `src/app.js` — CORS (`FRONT_END_URL`), JSON body, `/api-docs`, `/api/v1` routes, error middleware.

## Swagger

- `app.js` requires `./docs/swagger` relative to `src/` → expect `src/docs/swagger.js` (or adjust the path). If missing, `/api-docs` will fail at startup.

## User profile routes

- `index.js` may reference `./user.route`; if that file is absent, add the route module or fix the require to match the repo.

## Models (examples)

Products: `product`, `productVariant`, `productImage`, `category`, `color`, `size`, `material`. Orders/cart: `cart`, `cartItem`, `orderItem`, `payment`, `inventory`, `stockMovement`, `warehouse`.

## Tests

- Jest matches `**/tests/**/*.test.js`. Create `tests/` at repo root or under `src/` following that pattern.
