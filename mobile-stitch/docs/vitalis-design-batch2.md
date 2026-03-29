# Vitalis Health / The Clinical Atelier — Design batch 2

This document tracks the **second HTML handoff** (auth, checkout, profile hub, search, orders, cart, addresses, etc.) and how it maps into the React Native app.

## Screens in this batch

| Design | RN screen file | Stack / tab |
|--------|----------------|-------------|
| Auth Gate (EN) | `src/screens/auth/AuthGateScreen.tsx` | Stack |
| Send OTP (EN) | `src/screens/auth/SendOtpScreen.tsx` | Stack |
| Verify OTP (EN) | `src/screens/auth/VerifyOtpScreen.tsx` | Stack |
| Login (EN) | `src/screens/auth/LoginScreen.tsx` | Stack |
| Signup (EN) centered card | `src/screens/auth/SignupScreen.tsx` | Stack |
| Search (EN) | `src/screens/SearchScreen.tsx` | Tab **Search** |
| Product List / Vitamins (EN) | `src/screens/ProductListScreen.tsx` | Stack |
| Cart (EN) | `src/screens/CartScreen.tsx` | Tab **Cart** |
| Orders History (EN) | `src/screens/OrdersHistoryScreen.tsx` | Tab **Orders** |
| Profile Hub (EN) | `src/screens/ProfileHubScreen.tsx` | Tab **Profile** |
| Addresses (EN) | `src/screens/AddressesScreen.tsx` | Stack |
| Checkout / Create Order (EN) | `src/screens/CheckoutScreen.tsx` | Stack |
| Order Detail (EN) | `src/screens/OrderDetailScreen.tsx` | Stack |
| Pharmacy list (batch 1) | `src/screens/PharmacyListScreen.tsx` | Stack |

## Navigation model

- **Root stack** (`src/navigation/RootNavigator.tsx`): hosts the main tab navigator plus modal-style flows (auth, addresses, checkout, order detail, product list, pharmacy list).
- **Tabs** (`src/navigation/MainTabs.tsx`): **Home → Search → Orders → Cart → Profile** (5 tabs; matches the HTML shells that use Home / Search / Orders / Profile + cart as its own surface).

## Notes

- Full raw HTML exports are large; keep them in your design repo or Figma handoff. This repo implements **pixel-close** layouts with the shared palette in `src/theme/colors.ts` and `MaterialCommunityIcons` stand-ins for Material Symbols.
- **Auth**: `AuthContext` gates optional flows; the app defaults to **signed-in** so tabs work immediately. Use **Profile → Sign in** to open the auth gate, or **Logout** to clear the session.
