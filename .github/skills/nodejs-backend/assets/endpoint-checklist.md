# Backend Endpoint Checklist

Use this when adding or modifying an API endpoint.

- Route added/updated in `src/routes`.
- Route registered in `src/routes/index.js`.
- Controller method added/updated and wrapped with `try/catch` + `next(error)`.
- Service method added/updated with business validation.
- Expected errors throw with `error.status`.
- Request validation added (existing validation module or resource-local).
- DB model or migration updated if schema changed.
- Response shape matches project convention (`success`, `data`, `message`).
- Auth/authorization middleware applied where needed.
- Tests added or updated (`tests/**/*.test.js`).
- `npm test` passes.
