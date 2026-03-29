# Vitalis / Clinical Atelier — HTML stitch batch (EN): auth & commerce

This document continues the design inventory from exported HTML/Tailwind screens. It pairs each **HTML comment anchor** with the **React Native** surface in this repo (see `src/navigation/RootNavigator.tsx` and tab stack).

| Anchor | RN screen | Notes |
| --- | --- | --- |
| `<!-- AuthGate (EN) -->` | `AuthGateScreen` | Hero, CTAs, language/theme placeholders, footer links |
| `<!-- Verify OTP (EN) -->` | `VerifyOtpScreen` | 6-digit grid, timer, resend, verify CTA |
| `<!-- Verify OTP (EN) - Centered -->` | `VerifyOtpScreen` | Variant: left-aligned copy, underline OTP style — optional second layout |
| `<!-- Addresses (EN) - Centered -->` | `AddressesScreen` | Search + full-width add; list cards; bottom nav Profile active |
| `<!-- Send OTP (EN) -->` | `SendOtpScreen` | Country code + phone, SMS disclaimer |
| `<!-- Signup (EN) -->` | `SignupScreen` | Form + terms; optional bento strip |
| `<!-- Signup (EN) - Centered -->` | `SignupScreen` | Card + Google/Apple row — merge into one screen with props if needed |
| `<!-- Login (EN) -->` | `LoginScreen` | Split hero + form, social row |
| `<!-- Search (EN) -->` | `SearchScreen` | Categories, popular/recent, promo banner; Search tab active |
| `<!-- Product List (EN) -->` | `ProductListScreen` | Category header, filter/sort, grid, load more |
| `<!-- Cart (EN) -->` | `CartScreen` | Line items, promo, totals, checkout CTA |
| `<!-- Orders (EN) -->` | `OrdersHistoryScreen` | Filters, active + past cards, reorder |
| `<!-- Profile (EN) -->` | `ProfileHubScreen` | Bento hero, QR tile, clusters, settings/logout |
| `<!-- Create Order (EN) -->` | `CheckoutScreen` | Addresses, payment, review items, summary |
| `<!-- Order Detail (EN) -->` | `OrderDetailScreen` | Map, ref meta, timeline, contents, shipping/payment |
| `<!-- Addresses (EN) -->` | `AddressesScreen` | Alternate layout (search row + add button) — same data model |

## Shared tokens

- Palette: `src/theme/colors.ts` (aligns with Tailwind `extend.colors` in the HTML).
- Remote images: `src/assets/imagesBatch2.ts`.
- Header pattern: `ClinicalHeader` for stack routes; tab roots use `GlassTabBar`.

## Optional follow-ups

1. **Duplicate variants**: Merge “centered” vs default OTP/Signup into layout flags or separate small wrapper components.
2. **Navigation**: From `HomeScreen`, deep-link to `ProductList`, `Search`, or `PharmacyList` as product discovery entry points.
3. **RTL**: Auth and commerce strings should go through `src/i18n/strings.ts` where not already wired.
