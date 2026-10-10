/*
# Create tactical ops tables for Sentra Vision advanced modules

## Purpose
Persists the three new advanced-module data domains introduced by the TCREI
specification: operator mental state, geographic node missions, and crafted
items. The Flutter frontend reads and writes these tables directly via the
Supabase anon key (single-operator app, no sign-in screen).

## New Tables

### operator_mind_state
Single-row table tracking the operator's mental stability.
- `id` (int, primary key, always 1 — singleton)
- `stability` (double, 0–100, default 100)
- `state_mode` (text, 'REAL_NUMBER' or 'IMAGINARY_NUMBER', default 'REAL_NUMBER')
- `breach_exposure` (double, cumulative exposure, default 0)
- `updated_at` (timestamptz, auto-updated)

### node_mission
Geographic mission nodes the operator can approach.
- `id` (uuid, primary key)
- `title` (text, not null)
- `description` (text, not null)
- `latitude` (double, not null)
- `longitude` (double, not null)
- `breach_intensity` (int, 1–10, default 1)
- `status` (text, 'ACTIVE' | 'COMPLETED' | 'EXPIRED', default 'ACTIVE')
- `expires_at` (timestamptz, not null — 48h from creation by default)
- `created_at` (timestamptz, default now())

### crafted_item
Items the operator has crafted using loot points.
- `id` (uuid, primary key)
- `item_key` (text, not null — e.g. 'foam_shield', 'dea_adrenaline')
- `display_name` (text, not null)
- `loot_cost` (int, not null)
- `crafted_at` (timestamptz, default now())

## Security
- All three tables have RLS enabled.
- Policies allow anon + authenticated CRUD (single-tenant, no sign-in screen,
  data is intentionally shared/public).
- No user_id columns, no auth.uid() checks.
*/