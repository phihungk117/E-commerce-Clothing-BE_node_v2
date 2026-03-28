const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const routes = require('./routes');
const swaggerSpec = require('./docs/swagger');

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONT_END_URL || 'http://localhost:5173',
  credentials: true,
}));

// Middleware
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
app.use(express.urlencoded({ extended: true }));

// API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'E-commerce Clothing API Docs',
}));

// Routes
app.use('/api/v1', routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;