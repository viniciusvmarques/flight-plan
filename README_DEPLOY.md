# Marquisa Flight Briefing — Deploy rápido

## 1) Banco de dados (Postgres)
O backend usa Prisma + Postgres. Crie um Postgres (Render, Railway, Supabase, Neon, etc.) e pegue a `DATABASE_URL`.

Depois, no backend:
```bash
cd backend
cp .env.example .env
# edite .env com DATABASE_URL, JWT_SECRET, CORS_ORIGIN, etc.

npm install
npx prisma generate
npx prisma migrate deploy
npm start
```

## 2) Frontend
```bash
cd frontend
cp .env.example .env
# configure VITE_API_URL com a URL pública do backend

npm install
npm run build
npm run preview
```

## 3) Deploy sugerido
- **Backend:** Render / Railway / VPS (Node 18+)
- **DB:** Postgres gerenciado
- **Frontend:** Vercel / Netlify

### Variáveis importantes
Backend:
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN` (domínio do frontend)

Frontend:
- `VITE_API_URL` (domínio do backend)

## Assinatura (Stripe)
O backend está pronto para Stripe Checkout + Webhook + Customer Portal.

### Variáveis
No `backend/.env`:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (whsec...)
- `STRIPE_PRICE_ID` (price...)
- `APP_URL` (URL do frontend)

No `frontend/.env`:
- `VITE_STRIPE_PRICE_ID` (price...)

### Endpoints
- `POST /api/stripe/checkout` (autenticado) — cria uma assinatura com **7 dias de trial** e redireciona ao Stripe Checkout.
- `POST /api/stripe/portal` (autenticado) — abre o **Customer Portal** (cancelar/alterar cartão).
- `POST /api/stripe/webhook` — recebe eventos do Stripe e atualiza o plano do usuário.

Se o Stripe não estiver configurado, o sistema entra em **modo demo** e libera upgrade via `/api/demo/upgrade`.
