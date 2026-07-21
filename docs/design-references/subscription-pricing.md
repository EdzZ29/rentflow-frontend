# Subscription / Pricing — Design Reference

Reference design captured for the RentFlow subscription & pricing UI.
Source: Kimi Membership pricing page (2026-07-22). Use as a visual/layout
reference — **not** a copy target. Adapt to RentFlow's brand tokens
(`brand`, `accent`, slate scale) and plan model.

Related code: [OwnerSubscription.jsx](../../src/pages/owner/OwnerSubscription.jsx),
[Pricing.jsx](../../src/components/Pricing.jsx)

---

## Overall impression

Dark, premium, "concept-themed" pricing page. Everything is themed around a
**music motif** (plan names are tempo markings — Moderato, Allegretto, Allegro,
Vivace; treble-clef and sheet-music decorations; "Your Plan Plays From Here").
The takeaway for RentFlow isn't the music theme itself — it's the **structure
and hierarchy** of a well-organized multi-tier pricing page.

## Structure (top → bottom)

1. **Announcement banner** — full-width, rounded, muted card at top.
   Bold headline + 2 lines of small supporting copy. A right-aligned
   decorative graphic. Good pattern for "New plans coming soon" / policy notes.

2. **Section hero** — centered title with a small icon, one-line subtitle in
   muted text. Sets context before the plans.

3. **Billing toggle** — centered pill switch: `Monthly | Annually`.
   The active side is a filled pill; the annual option carries a small
   inline savings badge ("Save up to $480"). A separate outlined
   "Get Business" CTA sits to the right for enterprise/sales.

4. **Plan cards row** — 4 cards side by side, equal width.
   Each card:
   - Plan name (serif/display) + one-line tier tagline ("Advanced Flow",
     "Pro Choice", "Premium Mode", "Ultimate Boost").
   - Large price with `$` superscript, `/ month` suffix, and a
     **struck-through original price** next to it (discount framing).
   - "Billed for 12 months" fine print.
   - Full-width primary button (here shown as disabled "Sold out").
   - **Two feature groups per card**, visually separated:
     - Top group: checkmarked headline features, a few highlighted in the
       accent/brand color (e.g. "Kimi Code available").
     - "Research Preview" sub-group below a small heading — secondary
       features with small leading icons.
   - Higher tiers inherit lower-tier features and add more (classic ladder).

5. **Comparison table** — "Find Your Perfect Plan".
   - Sticky-ish header row: Plan name + price/year per column, with a CTA
     button under each plan column.
   - A small `Annually` toggle inside the table header (left column).
   - Rows = features; cells show a **value** ("2 tasks", "4x speed",
     "20GB"), a **checkmark** (included), or an **×** (not included / muted).
   - Alternating / highlighted rows for emphasis (e.g. the "Kimi Code" and
     "Customizable Dashboard" rows are tinted).
   - Free/entry tier ("Adagio, $0") is the first data column so users see the
     upgrade delta immediately.

6. **FAQ** — accordion list. First item expanded by default showing the
   answer; support email rendered as an accent-colored link. Remaining items
   collapsed with a chevron.

7. **Footer decoration** — full-width sheet-music graphic band, then a small
   "By paying, you agree to Terms of Service and Privacy Policy" line with
   inline links.

## Visual language

- **Theme:** dark background (near-black), cards a shade lighter, thin subtle
  borders, generous vertical rhythm.
- **Typography:** display/serif for plan names + section titles; clean sans for
  body; strong size contrast between price and everything else.
- **Color accents:** most text is white/muted-gray; a single bright accent
  (cyan/blue here) highlights key upsell features, links, and savings badges.
- **Price framing:** current price large + bold, original price struck through
  small beside it → anchors the discount.
- **Feature affordances:** checkmark = included, × = excluded/muted, plain text
  value = quota. Consistent leading icons for the "preview" feature group.
- **Buttons:** full-width in cards; state clearly communicated (disabled
  "Sold out" reads muted).

## What to borrow for RentFlow

- The **billing toggle + savings badge** pattern (RentFlow already has
  monthly/yearly — the annual-savings badge and struck-through price framing
  would strengthen it).
- The **multi-tier card ladder** if RentFlow expands beyond monthly/yearly, or
  to present Business vs Marketplace tiers more visually.
- The **feature comparison table** with value/check/× cells — much clearer than
  a flat feature list for comparing plans.
- **Two-group card layout** (headline features + secondary "preview" group).
- The **FAQ accordion** at the bottom of the pricing page.

## What NOT to copy

- The literal music theme and tempo-marking plan names — off-brand for RentFlow.
- "Sold out" button states (specific to a launch drop).
- Dark theme is optional — RentFlow currently uses a light slate/white theme;
  keep whichever the app standardizes on.
