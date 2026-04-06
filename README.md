# E-commerce Clothing Backend - Node.js REST API

A RESTful API backend server for an e-commerce clothing platform built with Node.js, Express, and MySQL.

## 📋 Features

- RESTful API architecture
- MySQL database integration
- User authentication and authorization
- User profile management
- Address book management
- Email verification and password reset flows
- Google authentication support
- Avatar uploads (Cloudinary)
- Admin user management endpoints

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MySQL](https://www.mysql.com/) (v5.7 or higher)
- [Git](https://git-scm.com/)

## 📦 Installation

1. **Clone the repository**

```bash
git clone https://github.com/nomhuynh/E-commerce-Clothing-BE_node.git
cd E-commerce-Clothing-BE_node
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env` file in the root directory and add the following variables (see `.env.example`). Some values are only required if you use email, media uploads, or Google login features:

```env
# Server Configuration
NODE_ENV=development
PORT=8080
FRONT_END_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=stylex
# Optional: overrides used when NODE_ENV=test or NODE_ENV=production
DB_NAME_TEST=stylex_test
DB_NAME_PROD=stylex_prod

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Email Configuration (required for verification + password reset emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="StyleX Support <no-reply@stylex.com>"

# Cloudinary Configuration (required for avatar uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Auth (required for Google login)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## 🗄️ Database Setup

1. **Create the MySQL database**

```bash
mysql -u root -p
```

```sql
CREATE DATABASE stylex;
USE stylex;
```

If you plan to run tests or production locally, also create databases matching `DB_NAME_TEST` and `DB_NAME_PROD`.

2. **Run database migrations**

```bash
npx sequelize-cli db:migrate
```

3. **Test the database connection** (optional)

```bash
node scripts/test-db.js
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
```

The server will start on `http://localhost:8080` (or the port specified in your `.env` file).

### Production Mode

```bash
npm start
# or
yarn start
```

## 📚 API Documentation

### Base URL

```
http://localhost:8080/api/v1
```

### Swagger UI

After starting the server, open:

```
http://localhost:8080/api-docs
```

Swagger UI provides an interactive interface to explore and test available API endpoints.

### Main Endpoints

#### Health
- `GET /api/v1/health` - Health check

#### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/change-password` - Change password (authenticated)
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/google` - Login with Google

#### Users
- `GET /api/v1/users/profile` - Get current user profile
- `PATCH /api/v1/users/profile` - Update current user profile
- `POST /api/v1/users/avatar` - Upload user avatar (multipart/form-data, field: `avatar`)
- `POST /api/v1/users/send-verification-otp` - Send email verification OTP
- `POST /api/v1/users/verify-email` - Verify email with OTP

#### Addresses
- `GET /api/v1/addresses` - Get user addresses
- `POST /api/v1/addresses` - Create an address
- `PUT /api/v1/addresses/:id` - Update an address
- `DELETE /api/v1/addresses/:id` - Delete an address

#### Admin (Users)
- `GET /api/v1/admin/users` - Get all users (Admin)
- `GET /api/v1/admin/users/:id` - Get user by ID (Admin)
- `PUT /api/v1/admin/users/:id` - Update user (Admin)

## 📁 Project Structure

```
E-commerce-Clothing-BE_node/
├── scripts/             # Utility scripts
├── src/
│   ├── app.js           # Express app setup
│   ├── server.js        # App entry point
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middleware
│   ├── migrations/      # Sequelize migrations
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── services/        # Business logic/services
├── .env.example         # Example environment variables
├── .gitignore           # Git ignore file
├── package.json         # Package dependencies
└── README.md            # This file
```

## 🧪 Testing

Run tests using:

```bash
npm test
```

## 🔧 Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm test` - Run tests

## 🛠️ Built With

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **Sequelize** or **mysql2** - MySQL ORM/driver
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **express-validator** - Input validation
- **multer** - File upload
- **nodemailer** - Email sending
- **cloudinary** - Media storage
- **google-auth-library** - Google OAuth support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Nom Huynh** - [nomhuynh](https://github.com/nomhuynh)

## 📞 Contact

If you have any questions or suggestions, feel free to reach out:

- GitHub: [@nomhuynh](https://github.com/nomhuynh)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped with this project
- Inspired by modern e-commerce platforms
- Built with best practices in REST API design

---

⭐️ If you find this project useful, please consider giving it a star on GitHub!


## 🚀 Deploy to Render (Docker)

This repo already includes:

- `Dockerfile`
- `render.yaml`
- `.github/workflows/backend-ci-cd.yml` (test + deploy hook)
- `.github/workflows/render-migrate.yml` (manual DB migration)

### 1) Create service on Render

- Connect your GitHub repo to Render
- Create a **Web Service** using this repo (or Blueprint from `render.yaml`)
- Runtime: **Docker**
- Health check: `/api/v1/health`

### 2) Set environment variables on Render

Required:

- `NODE_ENV=production`
- `PORT=10000`
- `FRONT_END_URL=<your-frontend-domain>`
- `DB_HOST`
- `DB_PORT=3306`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME_PROD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN=7d`

Optional (only if feature is used):

- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Google login: `GOOGLE_CLIENT_ID`

### 3) Configure GitHub Actions deploy hook

In Render Web Service settings, create/copy **Deploy Hook URL**.
Then add GitHub Actions secret:

- `RENDER_DEPLOY_HOOK_URL`

Workflow `backend-ci-cd.yml` will:

1. run tests on push/PR
2. trigger Render deploy on push to `main`/`master`

### 4) Run database migrations

Use manual GitHub Actions workflow: **Render DB Migrate (manual)**.
Add GitHub secrets used by migration job:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME_PROD`

Then run workflow `render-migrate.yml` via **Run workflow** button.


## 🐳 Build & Push Docker Image to Registry

This repo includes workflow:

- `.github/workflows/docker-publish.yml`

It will build from `Dockerfile` and push image to:

- `ghcr.io/<github-username>/e-commerce-clothing-api`

### Trigger

- Push to `main`/`master`
- Push Git tag `v*` (for release tags)
- Manual run via **workflow_dispatch**

### Required settings (GitHub)

1. Repository -> **Settings** -> **Actions** -> **General**
   - Workflow permissions: **Read and write permissions**
2. Package visibility (GHCR): set package to private/public as needed.

### Pull example

```bash
docker pull ghcr.io/<github-username>/e-commerce-clothing-api:latest
```

### Optional: Use Docker Hub instead of GHCR

If you prefer Docker Hub, change login + image name and add secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
