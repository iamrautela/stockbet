# StockBet Backend (Spring Boot + PostgreSQL)

**Ready-to-run backend** for your React/Tailwind/TS app at `iamrautela/stockbet`.

## Quickstart

1. Create a `.env` or export env vars (or edit `application.yml`):
```
export DB_URL=jdbc:postgresql://localhost:5432/stockbet
export DB_USER=stockbet
export DB_PASS=stockbet
export JWT_SECRET=change-me-super-secret
```
2. Run migrations & app:
```
./mvnw spring-boot:run
```
3. Swagger: (optional) not included; use the endpoints below.

## Core Resources & Endpoints

- `POST /api/auth/register` — body: `{email, password}`
- `POST /api/auth/login` — returns JWT
- `GET  /api/users/me` — profile & wallet
- `POST /api/wallet/deposit` — `{amount}`
- `GET  /api/markets` — list markets
- `POST /api/markets` — **admin** create market
- `POST /api/bets` — place bet `{marketId, outcome, amount}`
- `POST /api/admin/markets/{id}/resolve` — **admin** resolve `{resolution}`

Parimutuel payout on resolution with 2% fee. No external price feeds — resolve manually for now.

## Connect Frontend

Set `VITE_API_URL=http://localhost:8080` and send `Authorization: Bearer <token>` for protected routes.
