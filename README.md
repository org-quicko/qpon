# Qpon

**Qpon** is an open-source, self-hosted coupon framework for creating, managing, and validating coupons at scale. Built with **NestJS**, **PostgreSQL**, **TypeORM**, and **Angular**, Qpon is ideal for e-commerce, SaaS, and marketing teams seeking full control over their promotional workflows.

🌐 [Visit Qpon Website](https://quicko.company/labs/qpon) | 📖 [Documentation](https://org-quicko.github.io/qpon)

## Features

- 🧾 Create and manage coupons with custom rules and constraints
- 🛍️ Associate coupons with products or categories
- 🕒 Support start/end dates, usage limits, and redemption tracking
- 🧑‍🤝‍🧑 Multi-organization support with role-based access control
- 🔐 Secure API endpoints for managing and redeeming coupons
- 🔗 Easily integrate Qpon into your systems using REST API endpoints
- 🚀 Production-ready and easy to deploy with Docker

## Tech Stack

- **Backend:** [NestJS](https://nestjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [TypeORM](https://typeorm.io/)
- **Frontend:** [Angular](https://angular.dev/)

## Development

### 1. Prerequisites

- Node.js (>= 20.x)
- Docker (for containerized deployment)
- PostgreSQL (if not using Docker)

### 2. Running with Docker

The latest image is available on Docker Hub. Use the provided [`docker-compose.yml`](https://github.com/org-quicko/qpon/blob/main/docker-compose.yml):

```sh
# Download the compose file
curl -LO https://github.com/org-quicko/qpon/raw/main/docker-compose.yml

# Run the services in the background
docker compose up -d
```

**Note:** By default, Docker Compose expects a `.env` file for environment variables. You can also set these variables directly in your shell or hardcode them in `docker-compose.yml` if you prefer not to use a `.env` file.

Visit [http://localhost:3000](http://localhost:3000) to use the app.

### 3. Manual Setup

#### Backend (API)

```sh
cd api
npm install
npm run start:dev
```

#### Frontend

```sh
cd frontend
npm install --legacy-peer-deps
ng serve
```

## First-time Setup: Super Admin & Organization

After starting the services, visit [http://localhost:3000/setup](http://localhost:3000/setup) to set up the super admin user through the web interface.

## Environment Variables

| Variable    | Description                      | Example                  |
| ----------- | -------------------------------- | ------------------------ |
| DB_USERNAME | Database username                | qpon_user                |
| DB_PASSWORD | Database password                | strongpassword           |
| DB_NAME     | Database name                    | qpon_db                  |
| DB_HOST     | Database host                    | db (use 'db' for Docker) |
| JWT_SECRET  | JWT signing secret               | any-random-string        |
| SALT_ROUNDS | Bcrypt salt rounds for passwords | 10                       |

These variables can be set in a `.env` file, in your shell, or directly in `docker-compose.yml`.

## Project Structure

```
qpon/
  api/        # NestJS backend API
  frontend/   # Angular frontend web app
  lib/        # Shared TypeScript libraries (core, client, sheet-core)
  common/     # Shared resources (e.g., DB diagrams)
  resources/  # Global resources (e.g., Postman collections)
```

## Libraries

- `lib/core`: Common entities for Qpon
- `lib/sheet-core`: Sheet entities for Qpon
- `lib/client`: Client library to access Qpon APIs

## Resources

- **API Postman Collection:**[resources/json/org.quicko.qpon.postman_collection.json](https://github.com/org-quicko/qpon/blob/main/resources/json/org.quicko.qpon.postman_collection.json)
- **ER Diagram:**
  [common/org-quicko-qpon.pgerd](https://github.com/org-quicko/qpon/blob/main/common/org-quicko-qpon.pgerd)

## Contributing

Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.

## Maintainers

- [Quicko Engineering](mailto:developer@quicko.org.in)