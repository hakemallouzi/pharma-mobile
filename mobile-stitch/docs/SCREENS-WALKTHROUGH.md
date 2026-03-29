# Vitalis / Clinical Atelier — screens walkthrough

Work through this list to verify navigation and behavior. Implementation files live under `src/screens/` unless noted.

## How navigation works

- **Root stack** (`RootNavigator.tsx`): `Main` (tabs), auth flows, `Addresses`, `Checkout`, `OrderDetail`, `ProductList`, `PharmacyList`.
- **Tabs** (`MainTabs.tsx`): `Home`, `Search`, `Orders`, `Cart`, `Profile`.
- **`useAppNavigation()`** (`src/navigation/useAppNavigation.ts`): use from any screen to reach stack routes (e.g. `ProductList`) from tab children.
- **Nested tab targets**: `navigation.navigate('Main', { screen: 'Cart' })` switches tabs.

---

## 1. Main tabs (always reachable from bottom bar)

| # | Screen | File | Verify |
|---|--------|------|--------|
| 1.1 | Home | `HomeScreen.tsx` → `HomeEnScreen` / `HomeArScreen` | Search row → Search tab; categories / see all → `ProductList`; promo → Cart; nearby → `PharmacyList`; deliver/location → `Addresses`; profile icon → Profile tab; + on products → Cart. |
| 1.2 | Search | `SearchScreen.tsx` | Categories & View All → `ProductList`; popular chips & recent → `ProductList` with query; mic (with text) → search; promo → Cart; Clear recent clears list. |
| 1.3 | Orders | `OrdersHistoryScreen.tsx` | Track → `OrderDetail`; Reorder → Cart; Lab link → `OrderDetail`. |
| 1.4 | Cart | `CartScreen.tsx` | Proceed to checkout → `Checkout`. |
| 1.5 | Profile | `ProfileHubScreen.tsx` | Prescriptions → `ProductList`; Lab → `OrderDetail`; Orders → Orders tab; Addresses → `Addresses`; Payment → `Checkout`; Settings → alert; Logout → `AuthGate`; directory / sign-in links. |

---

## 2. Auth stack (no bottom bar)

| # | Screen | File | Verify |
|---|--------|------|--------|
| 2.1 | Auth gate | `auth/AuthGateScreen.tsx` | Phone → `SendOtp`; Get Started → `Signup`; Login link → `Login`; EN/AR toggles locale; theme → alert; footer Privacy/Terms/Support → link/mail. |
| 2.2 | Send OTP | `auth/SendOtpScreen.tsx` | Back; Send → `VerifyOtp`; support → mailto; menu → alert. |
| 2.3 | Verify OTP | `auth/VerifyOtpScreen.tsx` | Verify → `signIn` + reset to `Main`; Resend → alert. |
| 2.4 | Login | `auth/LoginScreen.tsx` | Login → `signIn` + reset to `Main`; Forgot → alert; Google/Apple → alert; Create account → `Signup`. |
| 2.5 | Signup | `auth/SignupScreen.tsx` | Create (with terms) → `signIn` + reset to `Main`; Google/Apple → alert; Sign in → `Login`. |

---

## 3. Commerce / account stack (opened from tabs or auth)

| # | Screen | File | Verify |
|---|--------|------|--------|
| 3.1 | Pharmacy list | `PharmacyListScreen.tsx` → EN/AR sub-screens | Back; search icon → Search tab; menu → Profile tab; chips filter locally. |
| 3.2 | Product list | `ProductListScreen.tsx` | Back; search icon → Search; cart icon → Cart; Add on card → Cart; Filter/Sort/Load more → Search; title reflects `category` / `query` params. |
| 3.3 | Addresses | `AddressesScreen.tsx` | Back; Add → alert; edit/delete → alert. |
| 3.4 | Checkout | `CheckoutScreen.tsx` | Back; Add New (address) → `Addresses`; Place order → `OrderDetail`. |
| 3.5 | Order detail | `OrderDetailScreen.tsx` | Back; Support / Returns → alerts. |

---

## 4. One-by-one QA order (recommended)

1. **Home (EN)** — tap search, one category, see all, promo, pharmacy card, map icon, account, product +.  
2. **Home (AR)** — toggle language in Profile; repeat smoke checks.  
3. **Search** — category, chip, recent row, clear, promo.  
4. **Cart** → **Checkout** → **OrderDetail**.  
5. **Orders** — track, reorder, lab link.  
6. **Profile** — each row, logout → Auth gate, browse pharmacies.  
7. **Auth** — AuthGate → SendOtp → VerifyOtp → lands on tabs.  
8. **Login / Signup** — success reaches tabs; stack cleared (no back to stale auth).  
9. **Pharmacy list** (from Home) — back, header icons.  
10. **Product list** (from Search/Home) — back, add, header icons.

---

## 5. Follow-up (not blocking demo)

- Replace `Alert` / `mailto` / placeholder URLs with real APIs, OAuth, and CMS pages.
- Persist cart and recent searches in global state or storage.
- Optional: `AuthProvider` + conditional initial route if you want logged-out users to land on `AuthGate` first.
