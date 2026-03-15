<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>

<p align="center">
 The fastest way to build apps with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a>
  <a href="#more-supabase-examples"><strong>More Examples</strong></a>
</p>
<br/>

## Features

- Works across the entire [Next.js](https://nextjs.org) stack
  - App Router
  - Pages Router
  - Proxy
  - Client
  - Server
  - It just works!
- supabase-ssr. A package to configure Supabase Auth to use cookies
- Password-based authentication block installed via the [Supabase UI Library](https://supabase.com/ui/docs/nextjs/password-based-auth)
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Components with [shadcn/ui](https://ui.shadcn.com/)
- Optional deployment with [Supabase Vercel Integration and Vercel deploy](#deploy-your-own)
  - Environment variables automatically assigned to Vercel project

## Demo

You can view a fully working demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

  ```env
  NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[INSERT SUPABASE PROJECT API PUBLISHABLE OR ANON KEY]
  ```
  > [!NOTE]
  > This example uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, which refers to Supabase's new **publishable** key format.
  > Both legacy **anon** keys and new **publishable** keys can be used with this variable name during the transition period. Supabase's dashboard may show `NEXT_PUBLIC_SUPABASE_ANON_KEY`; its value can be used in this example.
  > See the [full announcement](https://github.com/orgs/supabase/discussions/29260) for more information.

  Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)



# Philly Sprout — AI Agent Project README

> **This document is the authoritative reference for all AI agents, developers, and contributors working on this project. Read it in full before writing any code, designing any feature, or making any architectural decision.**

---

## Project Overview

**Philly Sprout** is a Next.js progressive web app (PWA) that helps Philadelphia residents identify and submit viable street tree planting sites through the Pennsylvania Horticultural Society (PHS) **TreeVitalize / Tree Tenders** program. The app uses a phone's camera and AI vision analysis to pre-screen sites against official PHS eligibility criteria, then guides users through completing and submitting a site record that maps to the official property owner application.

The ultimate goal is to lower the barrier for community members to participate in urban tree canopy expansion by replacing a paper form + hand-drawn map with a guided, camera-assisted mobile experience.

---

## Source of Truth: The Official PHS Application

The official document governing this project is the **"Property Owner Request to Plant a Street Tree in Philadelphia"** (TreeVitalize / PHS, 2010). A copy is stored at `/docs/Fall_2010_Tree_Application.pdf`. Everything the app collects, validates, and stores must map to fields or requirements in this document. Do not invent requirements that are not in the application.

The application has three parts:
1. **Property Owner Request Form** — contact info, owner attestations, tree count
2. **Map of Property and Requested Tree(s)** — site sketch + eligibility guidelines
3. **Property Owner Agreement** — terms the owner accepts by signing

---

## The Complete Application: Field-by-Field Breakdown

### Part 1: Property Owner Request Form

These fields must be collected from the user before final submission.

| Field | Required | Notes |
|---|---|---|
| Property address | Yes | Street address of the planting site |
| Zip code | Yes | |
| Property owner name | Yes | Must be the owner of record |
| Phone number | Yes | |
| Email address | Yes | |
| Mailing address | Only if different from property address | |
| Number of street trees requested | Yes | Trees planted between curb and sidewalk |
| Number of yard trees requested | Yes | Must be within 10 ft of public sidewalk; owner's sole responsibility |
| Comments | No | Free-text field for any additional notes |
| Optional site sketch / map | No | The app replaces this with a photo + GPS pin |

### Part 1: Owner Attestations (must be initialed/confirmed)

The user must explicitly confirm all of the following before submitting:

1. **"I am the property owner on record at this address."**
2. **"I have read and understand the terms described in 'Agreement to Plant a Street Tree.'"**
3. **"I agree to share in the responsibility to care for the requested tree(s)."**
4. **"By making this request through TreeVitalize, I agree not to make a duplicate request directly to the Fairmount Park Commission."**
5. **"If my site requires removal of concrete or paving materials in order to plant this tree, I give permission to have this done. I understand that if I cancel the tree installation after submitting this request form and the sidewalk has already been cut, I will be responsible for the cost of replacing the pavement."** (Note: Stump removal is the responsibility of the property owner.)
6. **"I am willing to volunteer to help plant my tree(s)."** (Note: This is optional, not mandatory.)

Each of these must be stored as a boolean on the submission record. Items 1–5 are required. Item 6 is optional.

### Part 3: Property Owner Agreement (informational — user must acknowledge)

By submitting, the user agrees to and acknowledges the following. These must be displayed to the user and acknowledged before final submission, but are not stored per-item — they are covered by the overall submission consent.

**Owner agrees to:**
- Allow a Fairmount Park Commission arborist to inspect the location
- Allow PHS and Fairmount Park to determine the appropriate tree species
- Allow tree pit cutting in sidewalk or pavement if required
- Water the tree 15–20 gallons per week, from March through December, for two years (cost is less than $1/year)
- Protect the tree from damage by cars, lawn mowers, etc.
- Notify Fairmount Park or PHS if the tree appears sick or damaged

**Owner understands:**
- The request may be denied (not all sites are appropriate)
- Even an approved site may be denied if found too close to underground utilities
- They are responsible for removal of any dead trees or stumps at the desired planting site
- Yard trees are the owner's sole responsibility
- Only the Fairmount Park Commission can authorize planting, pruning, or removing street trees

---

## Site Eligibility Criteria (The Checklist)

These are the official guidelines from the application's Map page. Every criterion must be evaluated. The app separates them into AI-assessable (from photo) and user-confirmed (requires local knowledge or measurement).

### AI-Assessable from Photo (Claude Vision)

| Criterion | Rule | Priority | DB Column |
|---|---|---|---|
| Minimum pit size | At least 3×3 ft of open ground available | High | `pit_size` |
| ADA sidewalk clearance | Tree pit edge at least 36 in (3 ft) from steps, stoops, or walls — to maintain 3 ft unobstructed sidewalk path (ADA-mandated) | High | `pit_edge_clearance` |
| No immediate obstructions | Not in front of steps, doorways, alleyways, or handicapped parking signs | High | `no_obstructions` |
| Driveway / drain clearance | At least 5 ft from driveways, manhole covers, storm drains, and main utility lines | Medium | `driveway_clearance` |
| Utility line edge clearance | Tree pit edge at least 18 in from utility lines (or soil must be dug by hand) | Medium | `utility_line_clearance` |

Each returns: `pass` / `fail` / `unclear`

### User-Confirmed (Cannot Be Assessed from Photo Alone)

| Criterion | Rule | Priority | DB Column |
|---|---|---|---|
| Not posted for sale | Site is not in front of a home currently listed for sale | High | `not_for_sale` |
| Corner / signal clearance | At least 30 ft from stop signs, traffic lights, and street corners | High | `corner_clearance` |
| Pole / hydrant clearance | At least 15 ft from light poles, utility poles, and fire hydrants | High | `pole_hydrant_clearance` |
| Tree-to-tree clearance | At least 15–30 ft from existing trees (distance depends on mature size and form) | Medium | `tree_clearance` |

Each is a manual boolean tap: `pass` / `fail`

### Overall Suitability Rating

Calculated from all criteria after AI assessment + user confirmation:

- **Likely Suitable** — All high-priority criteria pass; medium criteria pass or unclear
- **Possibly Suitable** — All high-priority criteria pass; one or more medium criteria fail or unclear
- **Likely Unsuitable** — One or more high-priority criteria fail

---

## MVP User Journey

### Step 1: Open the App
User opens the web app on their phone browser. App requests **location permission (GPS)** and **camera permission** via browser APIs.

### Step 2: Capture the Site
User points their camera at a potential tree pit location on a sidewalk and takes a photo. Camera is embedded in the browser via `getUserMedia`. No file upload required.

### Step 3: AI Assessment
The captured photo is sent to the **Claude Vision API** (model: `claude-sonnet-4-20250514`). Claude analyzes the image against the 5 visually-assessable criteria above and returns a structured result for each: `pass`, `fail`, or `unclear`, plus a free-text `ai_confidence_notes` summary explaining its reasoning.

**Claude's vision prompt must:**
- Reference each criterion by name and exact measurement threshold
- Return a structured JSON response (not prose)
- Express uncertainty as `unclear` rather than guessing
- Note any elements visible in the photo that influenced each judgment

### Step 4: User Confirms Checklist
- AI pre-fills the 5 visually-assessable items; user can override any judgment with a tap
- User manually answers the 4 non-visual criteria
- Any AI judgment the user overrides is recorded in `ai_overrides` (jsonb)
- Overall suitability rating is computed and displayed

### Step 5: Auto-Populated Submission Form
If overall suitability is **Likely Suitable** or **Possibly Suitable**, the submission form appears pre-filled with:
- Latitude / longitude (from GPS at time of photo)
- Assessment result summary (all criteria results)
- Photo (attached, stored in Supabase Storage)
- Date/time (auto)

User fills in the required owner fields (name, address, phone, email) if not already stored in their profile, confirms all 6 owner attestations, and acknowledges the Property Owner Agreement.

### Step 6: Submit
User taps **Submit Site**. Record is written to Supabase. A confirmation screen shows:
- A map pin of the submitted location
- Thank-you message
- Reminder of watering commitment (15–20 gal/week, March–December, 2 years)
- Link to their submission history

---

## Post-Submission Features (Authenticated Users)

Because the PHS application requires owners to notify Fairmount Park or PHS if a tree appears sick or damaged, the app includes a **Tree Health Portal** for authenticated users:

- View all previously submitted sites with current status
- Report a concern for an existing tree (sick, damaged, dead)
- Report a downed or missing tree
- All reports are stored in a separate `tree_health_reports` table linked to `tree_candidates`

---

## Database Schema

### Table: `tree_candidates`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, auto-generated |
| `created_at` | timestamptz | Auto-set on insert |
| `user_id` | uuid | FK to auth.users |
| `latitude` | float8 | From device GPS |
| `longitude` | float8 | From device GPS |
| `photo_url` | text | URL to photo in Supabase Storage |
| `street_address` | text | Optional, user-entered |
| `zip_code` | text | |
| `notes` | text | Optional, user-entered |
| `overall_suitability` | text | `likely_suitable` / `possibly_suitable` / `likely_unsuitable` |
| `pit_size` | enum (pass, fail, unclear) | AI-assessed |
| `pit_edge_clearance` | enum (pass, fail, unclear) | AI-assessed |
| `no_obstructions` | enum (pass, fail, unclear) | AI-assessed |
| `driveway_clearance` | enum (pass, fail, unclear) | AI-assessed |
| `utility_line_clearance` | enum (pass, fail, unclear) | AI-assessed |
| `not_for_sale` | enum (pass, fail) | User-confirmed |
| `corner_clearance` | enum (pass, fail) | User-confirmed |
| `pole_hydrant_clearance` | enum (pass, fail) | User-confirmed |
| `tree_clearance` | enum (pass, fail) | User-confirmed |
| `ai_overrides` | jsonb | Keys = criterion names, values = original AI result before override |
| `ai_confidence_notes` | text | Free-text summary from Claude |
| `street_trees_requested` | int2 | From owner form |
| `yard_trees_requested` | int2 | From owner form |
| `owner_name` | text | Property owner full name |
| `owner_phone` | text | |
| `owner_email` | text | |
| `owner_mailing_address` | text | Only if different from property address |
| `attest_is_owner` | boolean | Required — must be true |
| `attest_read_agreement` | boolean | Required — must be true |
| `attest_care_responsibility` | boolean | Required — must be true |
| `attest_no_duplicate_request` | boolean | Required — must be true |
| `attest_pavement_permission` | boolean | Required — must be true |
| `attest_volunteer` | boolean | Optional |
| `submission_status` | text | `draft` / `submitted` / `under_review` / `approved` / `denied` |

### Table: `tree_health_reports`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `created_at` | timestamptz | Auto-set |
| `user_id` | uuid | FK to auth.users |
| `tree_candidate_id` | uuid | FK to tree_candidates |
| `report_type` | text | `sick` / `damaged` / `dead` / `missing` |
| `description` | text | User-entered description |
| `photo_url` | text | Optional photo |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Camera | `getUserMedia` API (browser-native) |
| AI Vision | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (photos) |
| Hosting | Vercel |
| Maps | Mapbox GL JS or Leaflet (for submission confirmation pin) |

---

## Key Constraints & Decisions

- **No LiDAR required for MVP.** Spatial measurement is handled via Claude's vision analysis of the photo. LiDAR/WebXR is a future enhancement for Android Chrome users.
- **The app does not submit directly to PHS.** It produces a verified, AI-assisted site record that the user or a Tree Tenders group leader can use to support the official paper/email submission process. Direct API integration with PHS is a future goal.
- **The app is not a replacement for the arborist inspection.** The PHS application explicitly states that a Fairmount Park Commission arborist will inspect every approved site. The app is a pre-screening and documentation tool only.
- **All form fields must map to the official application.** Do not collect data that has no corresponding field in the PHS form. Do not omit any field from the PHS form without documenting the reason.
- **Owner attestations are legally meaningful.** They must be displayed clearly, confirmed individually, and stored as discrete boolean columns — not collapsed into a single "I agree" checkbox.
- **Uncertainty is acceptable.** Claude Vision should return `unclear` when it cannot confidently judge a criterion rather than guessing. The user confirms or overrides.

---

## Out of Scope for MVP

- Direct submission to PHS via API
- WebXR / LiDAR-based spatial measurement
- Species recommendation engine
- Admin portal for Tree Tenders group leaders
- Push notifications for submission status updates
- Offline mode

---

## Reference Documents

- `/docs/Fall_2010_Tree_Application.pdf` — Official PHS TreeVitalize property owner application (source of truth for all form fields and site criteria)
- This file (`README.md`) — Authoritative project spec for all agents and contributors