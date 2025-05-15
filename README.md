# Qpon

**Qpon** is an open-source, self-hosted coupon framework designed to help businesses create, manage, and validate coupons at scale. Built with **NestJS**, **PostgreSQL**, **TypeORM** and **Angular**, Qpon is ideal for e-commerce platforms, SaaS products, and marketing teams that need full control over their promotional workflows.


---

## Features

- 🧾 Create and manage coupons with custom rules and constraints
- 🛍️ Associate coupons with specific products or categories
- 🕒 Support for start/end dates, usage limits, and redemption tracking
- 🧑‍🤝‍🧑 Multi-organization support with role-based access control
- 🔐 Secure API endpoints for managing and redeeming coupons
- 🚀 Ready for production and easy to deploy with Docker

---

## Tech Stack

- **Backend:** [NestJS](https://nestjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [TypeORM](https://typeorm.io/)

---

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

---

### Backend (API)

The backend is built with [NestJS](https://nestjs.com/).

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

**API Documentation:**

- Use the provided Postman collection for testing:  
  `resources/json/org.quicko.qpon.postman_collection.json`

---

### Frontend (Web App)

The frontend is built with [Angular](https://angular.dev/).

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

---

### Libraries

- `lib/core/org-quicko-qpon-core`: Common entities for Qpon (TypeScript)
- `lib/core/org-quicko-qpon-sheet-core`: Sheet processing and schema generation
- `lib/client/org-quicko-qpon-client`: Client library to access Qpon APIs

Each library can be built and tested independently using their respective `package.json` scripts.

---

## Development

- **Backend:**  
  - Located in `api/`
  - Uses NestJS, TypeORM, and PostgreSQL
  - Scripts for code generation, migrations, and testing are in `api/package.json`

- **Frontend:**  
  - Located in `frontend/`
  - Uses Angular, TailwindCSS, and RxJS
  - Modular structure for components, services, and state management

- **Libraries:**  
  - Located in `lib/`
  - TypeScript-based, reusable across backend and frontend

---

## Resources

- **API Postman Collection:**  
  `resources/json/org.quicko.qpon.postman_collection.json`

- **Excel Templates:**  
  Found in `api/resources/excel/` and `frontend/resources/excel/`

- **DB Diagram:**  
  `common/org-quicko-qpon.pgerd`

---

## Contributing

Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.

---

## Authors

- [Quicko Engineering](mailto:developer@quicko.org.in)
- See individual `package.json` files for contributors.
