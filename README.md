# Qpon

**Qpon** is an open-source, self-hosted coupon framework for creating, managing, and validating coupons at scale. Built with **NestJS**, **PostgreSQL**, **TypeORM**, and **Angular**, Qpon is ideal for e-commerce, SaaS, and marketing teams seeking full control over their promotional workflows.

:globe_with_meridians: [Visit Qpon Website](https://quicko.company/labs/qpon)

## Features

- 🧾 Create and manage coupons with custom rules and constraints
- 🛍️ Associate coupons with products or categories
- 🕒 Support start/end dates, usage limits, and redemption tracking
- 🧑‍🤝‍🧑 Multi-organization support with role-based access control
- 🔐 Secure API endpoints for managing and redeeming coupons
- 🚀 Production-ready and easy to deploy with Docker

## Tech Stack

- **Backend:** [NestJS](https://nestjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [TypeORM](https://typeorm.io/)
- **Frontend:** [Angular](https://angular.dev/)

## Quick Start

### 1. Prerequisites

- Node.js (>= 18.x)
- npm (>= 9.x)
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

On a fresh install, manually create a super admin user and an organization using the API. This is a temporary setup step.

**1. Create Super Admin**
```sh
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<name>",
    "email": "<email>",
    "password": "<password>",
    "role": "super_admin"
  }'
```

**2. Get Auth Token (Login)**
```sh
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<email>",
    "password": "<password>"
  }'
```
> The response will contain a JWT token. Use this token in the Authorization header for the next step.

**3. Create Organization**
```sh
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "name": "<organization name>",
    "currency": "<currency>",
    "external_id": "<external_id>"
  }'
```

> Replace `localhost:3000` with your server's address if running in production or on a different host. The `external_id` field is optional.

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

- **API Postman Collection:**  
  `resources/json/org.quicko.qpon.postman_collection.json`
- **ER Diagram:**  
  `common/org-quicko-qpon.pgerd`

## Contributing

Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.

## Authors

- [Quicko Engineering](mailto:developer@quicko.org.in)