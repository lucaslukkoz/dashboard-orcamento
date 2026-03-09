# L9 Orçamento — Quotation System SaaS

## Project Overview

L9 Orçamento is a SaaS platform that allows companies to create, manage, and send quotations (budgets) to their clients. Companies register on the platform, manage their client base, and generate professional quotations that can be exported as PDF or sent directly through the system.

## Main Features

- **Company Registration & Authentication** — Companies create accounts and log in with JWT-based authentication.
- **Client Management** — Each company can register and manage multiple clients.
- **Quotation Creation** — Companies create detailed quotations containing items, quantities, prices, and conditions.
- **PDF Export** — Quotations can be exported as PDF documents for offline sharing.
- **Direct Quotation Delivery** — The platform sends quotations directly to clients via email through the SaaS.
- **Quotation History** — Companies can view, edit, and track past quotations.

## Backend Stack

| Technology | Purpose |
|---|---|
| TypeScript | Language |
| Express | HTTP framework |
| RESTful API | Architecture style |
| JWT | Authentication |
| MySQL | Database |
| Sequelize | ORM |

## Frontend Stack

| Technology | Purpose |
|---|---|
| Next.js | React framework (SSR, routing, pages) |
| TailwindCSS | Utility-first CSS styling |

## Folder Structure

```
backend/
└── src/
    ├── controllers/    # Request handlers and business logic
    ├── models/         # Sequelize model definitions
    ├── routes/         # Express route definitions
    ├── middlewares/     # Auth (JWT) and other middlewares
    ├── config/         # Database and app configuration
    ├── services/       # Business logic (PDF generation, email sending)
    └── utils/          # Helper functions

frontend/
├── app/               # Next.js App Router pages
├── components/        # Reusable UI components
├── services/          # API client functions
└── styles/            # Global styles and Tailwind config
```

## System Workflow

1. **Registration** — A company signs up providing name, email, and password.
2. **Login** — The company authenticates and receives a JWT token.
3. **Client Registration** — The company registers clients (name, email, phone, address).
4. **Quotation Creation** — The company creates a quotation selecting a client and adding items (description, quantity, unit price).
5. **Review & Edit** — The company reviews the quotation and can edit it before finalizing.
6. **Export / Send** — The company exports the quotation as PDF or sends it directly to the client's email via the platform.
