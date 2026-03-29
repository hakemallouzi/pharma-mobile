# End-to-End Flow Test Checklist

Use this to manually verify the full user flow on **Mobile app** and **Dashboard**.

**Prerequisites:** Backend running (`cd backend && npm run dev`), PostgreSQL with migrations applied.

---

## 1. OTP login → verify → sign-up

### Mobile

- [ ] Open app → **Auth** (or land on Send OTP).
- [ ] Enter phone (e.g. `0791234567`) → **Send OTP**.
- [ ] Check backend logs for OTP code (or DB `OtpCode` table).
- [ ] Enter OTP on **Verify OTP** screen → **Verify & sign in**.
- [ ] **New user:** Redirected to **Sign up** → enter name → **Continue** → land on Home.
- [ ] **Existing user:** Land on Home after verify (no sign-up screen).

### Dashboard

- [ ] Go to **Auth** → **Continue with phone** → enter phone → **Send OTP**.
- [ ] **Verify OTP** with code from logs/DB.
- [ ] New user → **Complete your profile** (name) → **Continue** → Orders.
- [ ] Existing user → Orders directly.

---

## 2. Addresses → select for orders

### Mobile

- [ ] From Home tap **Addresses**.
- [ ] **Add address** → fill City, Street (required), Area/Notes optional → **Save**.
- [ ] Address appears in list; tap to **select** (green “Selected”).
- [ ] Go to **Orders** → **New order** → chosen address is pre-selected (or pick from list).
- [ ] Create order using that address.

### Dashboard

- [ ] **Orders** (or equivalent) → add address if needed.
- [ ] Create order and select the address from the list.

---

## 3. Create order → prescription → list → real-time

### Mobile

- [ ] **Orders** → **New order**.
- [ ] Select **address** (or use default).
- [ ] Add **items** (e.g. medicine name, quantity); **Payment**: Cash on delivery (or Card).
- [ ] **Create order** → redirect to **Order detail**.
- [ ] **Upload prescription**: tap **Upload (camera or gallery)** → pick image → confirm upload success.
- [ ] Go back to **Orders** list → order appears with “Prescription attached” (or similar).
- [ ] Open **Order detail** again; keep screen open.
- [ ] In another device/browser: **Dashboard** → **Admin** → find same order → change **status** (e.g. to “confirmed” or “on_the_way”).
- [ ] **Mobile** order detail or list should **update in real time** (no manual refresh).

### Dashboard

- [ ] Create order with address and items, payment cash.
- [ ] Open order → upload prescription image.
- [ ] Orders list shows the order; refresh if needed.
- [ ] As admin, change order status; list/detail updates (or use real-time if implemented).

---

## 4. Notifications / real-time (summary)

- [ ] **Mobile**: Socket connected when logged in; on **Orders** screen, subscribe to orders; when admin updates status, list/detail updates without refresh.
- [ ] **Dashboard**: Admin updates status; mobile user sees update in real time.

---

## Quick API E2E (automated)

From backend folder, with server running:

```bash
cd backend
npm run test:api
```

Optional:

- `ADMIN_TOKEN=<admin-jwt>` — runs admin steps and triggers real-time test (socket subscribe + status update).
- `OTP_CODE=123456` — use specific OTP instead of reading from DB.
- `test-prescription.jpg` in backend root — runs prescription upload step.

Covers: health → send OTP → verify → sign-up (if new user) → add address → list addresses → create order → list orders → upload prescription → list orders again → (if ADMIN_TOKEN) socket subscribe + order_status_updated + admin driver assign.
