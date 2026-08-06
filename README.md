# 🐾 PawPulse — Smart Veterinary Care, Anywhere, Anytime

A production-grade veterinary telehealth platform built from scratch — connecting pet owners with licensed veterinarians for remote consultations, digital prescriptions, and complete medical record management.

**Live Demo:** [pawpulse-frontend.vercel.app](https://pawpulse-frontend.vercel.app)
**Backend API:** [pawpulse-backend.onrender.com/health](https://pawpulse-backend.onrender.com/health)

> ⚠️ Hosted on free-tier infrastructure. The backend may take 30–60 seconds to respond on first load after inactivity (Render free-tier cold start).

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Key Engineering Decisions](#key-engineering-decisions)
- [Features](#features)
- [Getting Started Locally](#getting-started-locally)
- [Project Structure](#project-structure)
- [What I'd Do Differently at Scale](#what-id-do-differently-at-scale)

---

## Overview

PawPulse is a full-stack, multi-role SaaS platform supporting four distinct user roles — **Animal Owners**, **Veterinarians**, **Clinic Admins**, and **Super Admins** — each with their own dashboard, permissions, and workflows. It was built module-by-module with an emphasis on production-grade backend architecture, security, and correct handling of real-world edge cases (race conditions, token revocation, state machines, idempotency) rather than tutorial-level CRUD.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, React Hook Form, TanStack Query, Framer Motion, Recharts, Socket.io-client

**Backend:** Node.js, Express 5, MongoDB (Mongoose), Socket.io, JWT, bcrypt, Zod, Winston, node-cron

**Infrastructure:** MongoDB Atlas, Render (backend), Vercel (frontend), Cloudinary (media), Nodemailer (email)

## Architecture

The backend follows a **feature-based, layered architecture**:

```
Route → Middleware (auth/validation) → Controller → Service → Model → MongoDB
```

Each feature (`auth`, `animals`, `appointments`, `consultations`, `prescriptions`, `admin`, etc.) is a self-contained module with its own model, validation schema, service, controller, and routes — colocated rather than split across layer-based folders. This keeps related code together and minimizes merge conflicts in a team setting.

**Controllers are intentionally thin** — they parse the request, delegate to a service, and shape the response. All business logic lives in the **service layer**, which has zero knowledge of Express (`req`/`res`) — making it framework-agnostic, unit-testable in isolation, and reusable from any calling context (HTTP, a cron job, a script).

## Key Engineering Decisions

A few decisions worth highlighting, since they reflect deliberate tradeoffs rather than defaults:

- **Two-token JWT auth with rotation** — short-lived access tokens (15 min, in-memory on the frontend) paired with long-lived, rotating refresh tokens (httpOnly cookies). Every refresh invalidates the previous token, meaning a stolen refresh token is single-use, not valid for its full lifetime.
- **Dual-layer authorization** — role-based checks (`authorize()` middleware, "what can this role generally do") are separated from resource-based ownership checks (service-layer, "does this specific user own this specific document") — because ownership can't be verified until the resource is actually fetched.
- **Computed-on-read doctor availability** — rather than pre-generating and storing every possible appointment slot (thousands of mostly-unused documents per doctor), available slots are calculated dynamically by combining a doctor's recurring weekly schedule with their existing bookings at request time.
- **Idempotent, race-condition-aware booking** — a server-side conflict check runs immediately before appointment creation, since a slot shown as "available" moments earlier could have been booked by someone else in the interim.
- **Explicit state machines** for both appointment status (`pending → confirmed → completed/cancelled`) and admin-gated doctor approval — invalid transitions (e.g., completing a cancelled appointment) are rejected at the service layer, with role-specific permission checks layered on top of structural validity checks.
- **Aggregation over duplication** — medical history has no dedicated collection; it's a read-side query joining existing Consultation and Prescription data, avoiding a data-synchronization problem that a duplicated `MedicalRecord` collection would introduce.
- **Graceful degradation for third-party services** — Cloudinary and email sending are optional at the config layer; their absence fails clearly (503) at the point of use rather than blocking server startup or crashing unrelated features.

## Features

- 🔐 JWT authentication with refresh rotation, email verification, role-based access control
- 🐕 Animal/pet management with full-text search, filtering, pagination
- 👨‍⚕️ Doctor profiles with recurring weekly availability and admin-gated approval
- 📅 Appointment booking with real-time slot availability and a status state machine
- 💬 Real-time consultation chat via authenticated Socket.io rooms
- 💊 Digital prescriptions tied to completed consultations
- 📋 Aggregated medical history timeline per animal
- ⏰ Cron-based, idempotent vaccination/medicine reminders
- 📊 Admin analytics dashboard with MongoDB aggregation pipelines, visualized with Recharts
- 📝 Public blog and user feedback system

## Getting Started Locally

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your own values
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev
```

Requires a MongoDB instance (Atlas or local via Docker: `docker run -d -p 27017:27017 mongo:7`).

## Project Structure

```
backend/src/
├── config/          # env validation, DB, logger, socket, cron setup
├── features/        # one folder per domain: auth, animals, appointments...
│   └── <feature>/
│       ├── *.model.js
│       ├── *.validation.js  (Zod)
│       ├── *.service.js     (business logic, framework-agnostic)
│       ├── *.controller.js  (thin HTTP layer)
│       └── *.routes.js
├── middleware/       # authenticate, authorize, validate, error handling
└── shared/           # ApiError, ApiResponse, asyncHandler

frontend/src/
├── api/              # axios call functions, grouped by feature
├── hooks/            # TanStack Query wrappers around api/
├── context/           # AuthContext, SocketContext
├── pages/              # route-level components, grouped by role
└── routes/              # route definitions, role-based guards
```

## What I'd Do Differently at Scale

Being direct about known tradeoffs, since recognizing them is as valuable as the implementation itself:

- The Consultation → Appointment status sync on consultation completion is two separate writes, not wrapped in a MongoDB transaction — acceptable at current scale, a real candidate for `session`-based transactions in production.
- `skip`/`limit` pagination is used throughout; at much larger data volumes, cursor-based pagination would avoid the performance degradation of large offsets.
- Payments were scoped out for this iteration (appointments are free), but the architecture (isolated feature module, signature-verified webhooks, idempotent event handling) was designed and documented before being descoped — see commit history.

---

Built as a deep, from-scratch learning project — every architectural decision above was deliberately reasoned through, not defaulted to.