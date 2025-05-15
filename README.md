# Qpon

**Qpon** is an open-source, self-hosted coupon framework designed to help businesses create, manage, and validate coupons at scale. Built with **NestJS**, **PostgreSQL**, **TypeORM** and **Angular**, Qpon is ideal for e-commerce platforms, SaaS products, and marketing teams that need full control over their promotional workflows.

## Features

- 🧾 Create and manage coupons with custom rules and constraints
- 🛍️ Associate coupons with specific products or categories
- 🕒 Support for start/end dates, usage limits, and redemption tracking
- 🧑‍🤝‍🧑 Multi-organization support with role-based access control
- 🔐 Secure API endpoints for managing and redeeming coupons
- 🚀 Ready for production and easy to deploy with Docker

## Tech Stack

- **Backend:** [NestJS](https://nestjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [TypeORM](https://typeorm.io/)

## Architecture

```
qpon/
  api/        # NestJS backend API
  frontend/   # Angular frontend web app
  lib/        # Shared TypeScript libraries (core, client, sheet-core)
  common/     # Shared resources (e.g., DB diagrams)
  resources/  # Global resources (e.g., Postman collections)
```

## Getting Started

### Prerequisites

- Node.js (>= 18.x)
- npm (>= 9.x)
- Docker (optional, for containerized deployment)

### Backend (API)

**Setup:**

```bash
cd api
npm install
```

**Run the API:**

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

**Database Migrations:**

```bash
# Generate and run migrations
npm run db:migrate
```

**Postman Collection:**

- Use the provided Postman collection for testing:  
  `resources/json/org.quicko.qpon.postman_collection.json`

### Frontend (Web App)

**Setup:**

```bash
cd frontend
npm install
```

**Run the Frontend:**

```bash
ng serve
# Visit http://localhost:4200/
```

**Build for Production:**

```bash
ng build
```

### Libraries

- `lib/core/org-quicko-qpon-core`: Common entities for Qpon
- `lib/core/org-quicko-qpon-sheet-core`: Sheet entities for Qpon
- `lib/client/org-quicko-qpon-client`: Client library to access Qpon APIs

## Development

- **Backend:**  
  - Located in `api/`
  - Uses NestJS, TypeORM, and PostgreSQL

- **Frontend:**  
  - Located in `frontend/`
  - Uses Angular, TailwindCSS, and RxJS
  - Modular structure for components, services, and state management

- **Libraries:**  
  - Located in `lib/`
  - TypeScript-based entities and client for Qpon APIs

## Resources

- **API Postman Collection:**  
  `resources/json/org.quicko.qpon.postman_collection.json`

- **Excel Templates for Sheet:**  
  Found in `api/resources/excel/` and `frontend/resources/excel/`

- **ER Diagram:**  
  `common/org-quicko-qpon.pgerd`

## Contributing

Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.

## Authors

- [Quicko Engineering](mailto:developer@quicko.org.in)
- See individual `package.json` files for contributors.
