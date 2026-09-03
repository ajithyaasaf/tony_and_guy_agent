# TONI&GUY AI Customer Concierge

Production-quality digital customer experience and AI concierge system for TONI&GUY.

---

## Quick Start (Single Command)

To run **both the Next.js frontend and the NestJS backend simultaneously** in development mode:

```bash
npm run dev:all
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Health Check:** [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

---

## Running Individually

If you prefer running services in separate terminal windows:

### Frontend (Next.js 16 + React 19 + Tailwind CSS)
```bash
npm run dev
```

### Backend (NestJS + TypeScript)
```bash
npm run backend:dev
```

---

## Testing

### 1. Booking Engine & State Machine QA Suite (126 Tests)
Validates all 17 booking scenarios, context preservation, and state convergence:
```bash
npx tsx src/__tests__/qa-booking-engine.ts
```

### 2. Backend E2E Test Suite
Validates backend routing, security CORS, and health endpoints:
```bash
npm run backend:test:e2e
```

### 3. Production Builds & Type-Checking
```bash
npm run build          # Next.js frontend build
npm run backend:build  # NestJS backend compilation
```

---

## Project Structure

```
.
├── src/                    # Next.js Frontend Application
│   ├── app/                # App Router pages (/services, /offers, /salons, /consultation, /book)
│   ├── components/         # Luxury UI component library
│   ├── data/               # 64 outlets, 22 services, 8 combos, 256 staff
│   ├── features/           # Adaptive booking reducer & AI concierge logic
│   └── lib/                # Formatting and utility functions
├── backend/                # Modular NestJS Backend Application
│   ├── src/
│   │   ├── modules/        # Outlets, Services, Bookings, Consultations, Health
│   │   ├── common/         # Filters, interceptors, validation pipes
│   │   └── config/         # Environment configuration
│   └── test/               # Backend E2E test suites
└── package.json            # Root workspace scripts & dependencies
```
