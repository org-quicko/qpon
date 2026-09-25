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

| Variable     | Description                       | Example                                              |
| ------------ | ---------------------------------- | ----------------------------------------------------- |
| DATABASE_URL | Full Postgres connection string used by the API to connect (required) | postgres://qpon_user:strongpassword@db:5432/qpon_db |
| DB_SCHEMA    | Postgres schema for tables/migrations (defaults to `public`) | qpon      |
| DB_SSL       | Enable TLS for the Postgres connection (needed for most managed Postgres, e.g. RDS/Aurora) | true |
| DB_SSL_REJECT_UNAUTHORIZED | Verify the server certificate against Node's trusted CAs (defaults to false) | true |
| DB_USERNAME  | Postgres user, used to provision the `db` container in Docker Compose | qpon_user                |
| DB_PASSWORD  | Postgres password, used to provision the `db` container in Docker Compose | strongpassword           |
| DB_NAME      | Postgres database name, used to provision the `db` container in Docker Compose | qpon_db                  |
| JWT_SECRET   | JWT signing secret                 | any-random-string        |
| SALT_ROUNDS  | Bcrypt salt rounds for passwords   | 10                       |

These variables can be set in a `.env` file, in your shell, or directly in `docker-compose.yml`. The API only reads `DATABASE_URL` (and optionally `DB_SCHEMA`, `DB_SSL`, `DB_SSL_REJECT_UNAUTHORIZED`) to connect — `DB_USERNAME`/`DB_PASSWORD`/`DB_NAME` are used solely to provision the Postgres container when using Docker Compose; embed matching values in `DATABASE_URL` yourself.

**Notes when using `DB_SCHEMA`:**
- The schema must already exist in the database before the app starts or migrations run (e.g. `CREATE SCHEMA IF NOT EXISTS <schema>;`). Postgres does not auto-create it, and if it's missing, table creation silently falls back to `public` instead of failing loudly.

**Notes when using `DB_SSL`:**
- Most managed Postgres (RDS, Aurora, etc.) requires or enforces TLS. Set `DB_SSL=true` to connect over TLS.
- Certificate verification (`DB_SSL_REJECT_UNAUTHORIZED=true`) is off by default because Node doesn't trust Amazon's RDS CA out of the box — enabling it without also supplying that CA will fail to connect. Leave it unset/`false` unless you've configured a trusted CA.

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