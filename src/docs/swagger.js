const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'E-commerce Clothing API',
    version: '1.0.0',
    description: 'API documentation for the E-commerce Clothing backend.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Addresses' },
    { name: 'Admin Users' },
    { name: 'Products' },
    { name: 'Categories' },
    { name: 'Colors' },
    { name: 'Sizes' },
    { name: 'Materials' },
    { name: 'Usages' },
    { name: 'Promotions' },
    { name: 'Coupons' },
    { name: 'Cart' },
    { name: 'Orders' },
    { name: 'Reviews' },
    { name: 'Wishlist' },
    { name: 'Shipping' },
    { name: 'Payments' },
    { name: 'Notifications' },
    { name: 'Push' },
    { name: 'Admin Promotions' },
    { name: 'Admin Coupons' },
    { name: 'Admin Orders' },
    { name: 'Admin Reviews' },
    { name: 'Admin Inventory' },
    { name: 'Admin Dashboard' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Server is healthy',
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        responses: {
          201: { description: 'Created' },
          400: { description: 'Bad request' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change password',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Password changed' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset',
        responses: {
          200: { description: 'Reset email sent' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password with token',
        responses: {
          200: { description: 'Password reset success' },
          400: { description: 'Invalid token or input' },
        },
      },
    },
    '/auth/google': {
      post: {
        tags: ['Auth'],
        summary: 'Login with Google',
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Updated' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/users/avatar': {
      post: {
        tags: ['Users'],
        summary: 'Upload user avatar',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Uploaded' },
          400: { description: 'Bad request' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/users/send-verification-otp': {
      post: {
        tags: ['Users'],
        summary: 'Send email verification OTP',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OTP sent' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/users/verify-email': {
      post: {
        tags: ['Users'],
        summary: 'Verify email with OTP',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Verified' },
          400: { description: 'Invalid OTP' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/addresses': {
      get: {
        tags: ['Addresses'],
        summary: 'Get user addresses',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Addresses'],
        summary: 'Create an address',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Created' },
          400: { description: 'Bad request' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/addresses/{id}': {
      put: {
        tags: ['Addresses'],
        summary: 'Update an address',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Updated' },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Addresses'],
        summary: 'Delete an address',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Deleted' },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found' },
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin Users'],
        summary: 'Get all users (Admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/admin/users/{id}': {
      get: {
        tags: ['Admin Users'],
        summary: 'Get user by ID (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'OK' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Admin Users'],
        summary: 'Update user (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Updated' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' },
        },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Get products',
        responses: { 200: { description: 'OK' } },
      },
      post: {
        tags: ['Products'],
        summary: 'Create product',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Created' }, 403: { description: 'Forbidden' } },
      },
    },
    '/products/search': {
      get: {
        tags: ['Products'],
        summary: 'Search products',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/products/filters': {
      get: {
        tags: ['Products'],
        summary: 'Get filter options',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['Products'],
        summary: 'Update product',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Deleted' }, 403: { description: 'Forbidden' } },
      },
    },
    '/products/{productId}/variants': {
      get: {
        tags: ['Products'],
        summary: 'Get variants by product',
        parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        tags: ['Products'],
        summary: 'Create variant',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }],
        responses: { 201: { description: 'Created' }, 403: { description: 'Forbidden' } },
      },
    },
    '/products/{productId}/variants/{id}': {
      patch: {
        tags: ['Products'],
        summary: 'Update variant',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'productId', required: true, schema: { type: 'integer' } },
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete variant',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'productId', required: true, schema: { type: 'integer' } },
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Deleted' }, 403: { description: 'Forbidden' } },
      },
    },
    '/products/{productId}/variants/{id}/stock': {
      patch: {
        tags: ['Products'],
        summary: 'Update variant stock',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'productId', required: true, schema: { type: 'integer' } },
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } },
      },
    },
    '/products/{productId}/images': {
      get: {
        tags: ['Products'],
        summary: 'Get product images',
        parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        tags: ['Products'],
        summary: 'Create product image',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }],
        responses: { 201: { description: 'Created' }, 403: { description: 'Forbidden' } },
      },
    },
    '/products/{productId}/images/{id}': {
      patch: {
        tags: ['Products'],
        summary: 'Update product image',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'productId', required: true, schema: { type: 'integer' } },
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product image',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'productId', required: true, schema: { type: 'integer' } },
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Deleted' }, 403: { description: 'Forbidden' } },
      },
    },
    '/products/{productId}/images/{id}/thumbnail': {
      patch: {
        tags: ['Products'],
        summary: 'Set product thumbnail',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'productId', required: true, schema: { type: 'integer' } },
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } },
      },
    },
    '/products/{productId}/images/reorder': {
      put: {
        tags: ['Products'],
        summary: 'Reorder product images',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } },
      },
    },
    '/categories': {
      get: { tags: ['Categories'], summary: 'Get categories', responses: { 200: { description: 'OK' } } },
      post: {
        tags: ['Categories'],
        summary: 'Create category',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Created' }, 403: { description: 'Forbidden' } },
      },
    },
    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Get category by ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['Categories'],
        summary: 'Update category',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete category',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Deleted' }, 403: { description: 'Forbidden' } },
      },
    },
    '/colors': {
      get: { tags: ['Colors'], summary: 'Get colors', responses: { 200: { description: 'OK' } } },
      post: {
        tags: ['Colors'],
        summary: 'Create color',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Created' }, 403: { description: 'Forbidden' } },
      },
    },
    '/colors/{id}': {
      get: {
        tags: ['Colors'],
        summary: 'Get color by ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' } },
      },
      patch: {
        tags: ['Colors'],
        summary: 'Update color',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Colors'],
        summary: 'Delete color',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    '/sizes': {
      get: { tags: ['Sizes'], summary: 'Get sizes', responses: { 200: { description: 'OK' } } },
      post: {
        tags: ['Sizes'],
        summary: 'Create size',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Created' } },
      },
    },
    '/sizes/{id}': {
      get: { tags: ['Sizes'], summary: 'Get size by ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Sizes'], summary: 'Update size', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Sizes'], summary: 'Delete size', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/materials': {
      get: { tags: ['Materials'], summary: 'Get materials', responses: { 200: { description: 'OK' } } },
      post: { tags: ['Materials'], summary: 'Create material', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/materials/{id}': {
      get: { tags: ['Materials'], summary: 'Get material by ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Materials'], summary: 'Update material', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Materials'], summary: 'Delete material', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/usages': {
      get: { tags: ['Usages'], summary: 'Get usages', responses: { 200: { description: 'OK' } } },
      post: { tags: ['Usages'], summary: 'Create usage', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/usages/{id}': {
      get: { tags: ['Usages'], summary: 'Get usage by ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Usages'], summary: 'Update usage', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Usages'], summary: 'Delete usage', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/promotions': {
      get: { tags: ['Promotions'], summary: 'Get active promotions', responses: { 200: { description: 'OK' } } },
    },
    '/promotions/{id}': {
      get: { tags: ['Promotions'], summary: 'Get promotion by ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/coupons/validate': {
      post: { tags: ['Coupons'], summary: 'Validate coupon', responses: { 200: { description: 'OK' } } },
    },
    '/coupons/apply': {
      post: { tags: ['Coupons'], summary: 'Apply coupon', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/cart': {
      get: { tags: ['Cart'], summary: 'Get cart', responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Cart'], summary: 'Clear cart', responses: { 200: { description: 'OK' } } },
    },
    '/cart/items': {
      post: { tags: ['Cart'], summary: 'Add item to cart', responses: { 200: { description: 'OK' } } },
    },
    '/cart/items/{variantId}': {
      patch: { tags: ['Cart'], summary: 'Update cart item', parameters: [{ in: 'path', name: 'variantId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Cart'], summary: 'Remove cart item', parameters: [{ in: 'path', name: 'variantId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/cart/coupon': {
      post: { tags: ['Cart'], summary: 'Apply coupon to cart', responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Cart'], summary: 'Remove coupon from cart', responses: { 200: { description: 'OK' } } },
    },
    '/orders': {
      post: { tags: ['Orders'], summary: 'Create order', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/orders/my-orders': {
      get: { tags: ['Orders'], summary: 'Get my orders', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/orders/my-orders/{orderId}': {
      get: { tags: ['Orders'], summary: 'Get my order detail', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/orders/{orderId}/cancel': {
      post: { tags: ['Orders'], summary: 'Cancel order', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/orders/{orderId}/return-request': {
      post: { tags: ['Orders'], summary: 'Request return', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/reviews/product/{productId}': {
      get: { tags: ['Reviews'], summary: 'Get reviews by product', parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/reviews': {
      post: { tags: ['Reviews'], summary: 'Create review', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/reviews/my-review/{productId}': {
      get: { tags: ['Reviews'], summary: 'Get my review', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/reviews/{reviewId}': {
      patch: { tags: ['Reviews'], summary: 'Update review', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'reviewId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Reviews'], summary: 'Delete review', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'reviewId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/wishlist': {
      get: { tags: ['Wishlist'], summary: 'Get wishlist', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
      post: { tags: ['Wishlist'], summary: 'Add to wishlist', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/wishlist/{productId}': {
      delete: { tags: ['Wishlist'], summary: 'Remove from wishlist', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/wishlist/check/{productId}': {
      get: { tags: ['Wishlist'], summary: 'Check in wishlist', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/shipping': {
      get: { tags: ['Shipping'], summary: 'Get shipping methods', responses: { 200: { description: 'OK' } } },
      post: { tags: ['Shipping'], summary: 'Create shipping method', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/shipping/zones': {
      get: { tags: ['Shipping'], summary: 'Get shipping zones', responses: { 200: { description: 'OK' } } },
      post: { tags: ['Shipping'], summary: 'Create shipping zone', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/shipping/{methodId}': {
      get: { tags: ['Shipping'], summary: 'Get shipping method by ID', parameters: [{ in: 'path', name: 'methodId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Shipping'], summary: 'Update shipping method', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'methodId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Shipping'], summary: 'Delete shipping method', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'methodId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/shipping/calculate': {
      post: { tags: ['Shipping'], summary: 'Calculate shipping', responses: { 200: { description: 'OK' } } },
    },
    '/shipping/zones/{zoneId}': {
      patch: { tags: ['Shipping'], summary: 'Update shipping zone', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'zoneId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Shipping'], summary: 'Delete shipping zone', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'zoneId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/shipping/{methodId}/zones': {
      get: { tags: ['Shipping'], summary: 'Get method zones', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'methodId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      post: { tags: ['Shipping'], summary: 'Assign zone to method', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'methodId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/payments/create-url': {
      post: { tags: ['Payments'], summary: 'Create payment URL', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/payments/callback/{paymentMethod}': {
      post: { tags: ['Payments'], summary: 'Payment callback', parameters: [{ in: 'path', name: 'paymentMethod', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/payments/webhook/{provider}': {
      post: { tags: ['Payments'], summary: 'Provider webhook', parameters: [{ in: 'path', name: 'provider', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/payments/refund/{orderId}': {
      post: { tags: ['Payments'], summary: 'Refund payment', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/payments/verify/{orderId}': {
      get: { tags: ['Payments'], summary: 'Verify payment', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/payments/order/{orderId}': {
      get: { tags: ['Payments'], summary: 'Get payment status by order', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/notifications': {
      get: { tags: ['Notifications'], summary: 'Get notifications', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/notifications/unread-count': {
      get: { tags: ['Notifications'], summary: 'Get unread count', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/notifications/read-all': {
      patch: { tags: ['Notifications'], summary: 'Mark all as read', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/notifications/{notificationId}/read': {
      patch: { tags: ['Notifications'], summary: 'Mark as read', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'notificationId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/notifications/{notificationId}': {
      delete: { tags: ['Notifications'], summary: 'Delete notification', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'notificationId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/notifications/broadcast': {
      post: { tags: ['Notifications'], summary: 'Broadcast notification', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/push/register': {
      post: { tags: ['Push'], summary: 'Register push token', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/push/unregister': {
      post: { tags: ['Push'], summary: 'Unregister push token', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/promotions': {
      get: { tags: ['Admin Promotions'], summary: 'Get all promotions (Admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
      post: { tags: ['Admin Promotions'], summary: 'Create promotion (Admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/admin/promotions/{id}': {
      get: { tags: ['Admin Promotions'], summary: 'Get promotion by ID (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Admin Promotions'], summary: 'Update promotion (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin Promotions'], summary: 'Delete promotion (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/admin/promotions/{id}/products': {
      post: { tags: ['Admin Promotions'], summary: 'Add products to promotion (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/promotions/{id}/products/{productId}': {
      delete: { tags: ['Admin Promotions'], summary: 'Remove product from promotion (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }, { in: 'path', name: 'productId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/coupons': {
      get: { tags: ['Admin Coupons'], summary: 'Get all coupons (Admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
      post: { tags: ['Admin Coupons'], summary: 'Create coupon (Admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Created' } } },
    },
    '/admin/coupons/{id}': {
      get: { tags: ['Admin Coupons'], summary: 'Get coupon by ID (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Admin Coupons'], summary: 'Update coupon (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin Coupons'], summary: 'Delete coupon (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/admin/coupons/{id}/usages': {
      get: { tags: ['Admin Coupons'], summary: 'Get coupon usages (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/orders': {
      get: { tags: ['Admin Orders'], summary: 'Get all orders (Admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/orders/{orderId}': {
      get: { tags: ['Admin Orders'], summary: 'Get order detail (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/orders/{orderId}/status': {
      patch: { tags: ['Admin Orders'], summary: 'Update order status (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated' } } },
    },
    '/admin/orders/{orderId}/return': {
      patch: { tags: ['Admin Orders'], summary: 'Process return (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated' } } },
    },
    '/admin/reviews': {
      get: { tags: ['Admin Reviews'], summary: 'Get all reviews (Admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/reviews/{reviewId}/status': {
      patch: { tags: ['Admin Reviews'], summary: 'Update review status (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'reviewId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated' } } },
    },
    '/admin/inventory': {
      get: { tags: ['Admin Inventory'], summary: 'Get inventory (Admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/inventory/movements': {
      get: { tags: ['Admin Inventory'], summary: 'Get inventory movements (Admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/inventory/{inventoryId}/adjust': {
      patch: { tags: ['Admin Inventory'], summary: 'Adjust inventory (Admin)', security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'inventoryId', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated' } } },
    },
    '/admin/dashboard/overview': {
      get: { tags: ['Admin Dashboard'], summary: 'Dashboard overview', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/dashboard/revenue-chart': {
      get: { tags: ['Admin Dashboard'], summary: 'Revenue chart', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/dashboard/top-products': {
      get: { tags: ['Admin Dashboard'], summary: 'Top products', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/dashboard/top-categories': {
      get: { tags: ['Admin Dashboard'], summary: 'Top categories', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/dashboard/customer-stats': {
      get: { tags: ['Admin Dashboard'], summary: 'Customer stats', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/admin/dashboard/reviews-stats': {
      get: { tags: ['Admin Dashboard'], summary: 'Reviews stats', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
    },
  },
};

const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: ['src/routes/**/*.js', 'src/controllers/**/*.js', 'src/models/**/*.js'],
});

module.exports = swaggerSpec;
