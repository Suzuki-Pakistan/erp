---
name: flair-erp-module-01-core-setup
type: loop-engineering-build-spec
version: 1.0
status: implementation-ready
target: Next.js frontend prototype
primary_module: "01 — Core Setup"
brand: "Flair Cosmetic & Fragrance"
source_site: "https://flairperfumes.com/"
---

# Flair ERP — Module 01: Core Setup
## Loop Engineering Build Specification

> **Purpose:** This file is the single implementation contract for an autonomous coding agent building the first module of the Flair ERP frontend.  
> Build the experience, verify it, visually polish it, and keep iterating until the Definition of Done is satisfied.  
> Do **not** invent a backend, database, real authentication, or API integrations in this delivery.

---

# 1. Mission

Create a **premium, modern, enterprise-grade ERP frontend** for **Flair Cosmetic & Fragrance**, focused on **Module 01 — Core Setup**.

The application must feel:

- polished enough for a serious client demo,
- visually aligned with Flair's existing brand,
- intentionally designed rather than template-like,
- fast and clean on desktop,
- excellent on tablet and mobile,
- fully interactive using frontend-only mock state,
- rich with meaningful dummy data,
- complete enough that every important action feels real,
- scalable in structure so Modules 02–09 can be implemented later without redesigning the shell.

This is **not** an e-commerce storefront.  
It is an **internal operations platform** inspired by the brand's visual language.

The final UI should feel like:

> **luxury retail brand × enterprise operations software × modern data workspace**

Avoid the visual feeling of a generic admin template.

---

# 2. Source Hierarchy

Use these sources in this exact priority order when requirements overlap.

## Priority 1 — Current user brief

The current brief overrides older naming or implementation assumptions.

Hard requirements:

- frontend only,
- Next.js latest stable / Active LTS,
- shadcn/ui,
- only Module 01 is implemented,
- Modules 02–09 must appear in the sidebar,
- Modules 02–09 must **not** navigate,
- all meaningful create/edit actions should use professional popups,
- dummy data must be extensive and realistic,
- image assets / image placeholders must be created,
- brand direction must come from `https://flairperfumes.com/`,
- layout must be highly responsive,
- overall result must be modern, professional, premium, and presentation-ready.

## Priority 2 — ERP Platform Sitemap

Module 01 contains these four source-defined pages:

1. **Stores & Warehouses**
   - Add / edit store & warehouse locations
   - Assign warehouse type: retail, main, e-commerce

2. **Users & Roles**
   - Staff accounts
   - Role assignment:
     - Admin
     - Accountant
     - Procurement
     - Sales
     - Inventory
     - Cashier

3. **Permissions**
   - Module-level access control
   - Data visibility rules:
     - pricing
     - purchasing
     - accounting
     - reports

4. **Company Settings**
   - General configuration
   - Business profile

Global/system concepts defined by the sitemap include:

- Dashboard / role-based home
- Notifications
- User profile & settings
- Global search
- Audit log

For this first delivery, these global concepts may be represented through the application shell and Core Setup overview without expanding into unrelated full modules.

## Priority 3 — ERP Proposal

Module 01 is the foundation and has no dependencies.

Its purpose is to:

- manage multiple stores / warehouses in one system,
- provide staff logins for operational roles,
- control who can see sensitive business areas such as pricing, purchasing, accounting, and reports.

The larger platform is a modular ERP for a perfume and cosmetics business spanning retail, wholesale, inventory, e-commerce, reporting, forecasting, and finance.

## Priority 4 — Live Flair website

Use the live Flair website for:

- official company naming,
- logo / wordmark if publicly available,
- brand tone,
- visual language,
- typography direction,
- colors,
- photography direction,
- business profile details used in demo settings.

The current brand communicates:

- authenticity,
- fairness and transparent pricing,
- thoughtful curation,
- reliable stock and availability,
- trust and long-term relationships.

Its fragrance imagery strongly uses luxurious warm materials and atmospheric scenes such as:

- amber / gold,
- soft ivory,
- dark charcoal,
- deep green,
- rose / burgundy fabric,
- warm premium lighting,
- refined product photography.

**Important:** do not convert the ERP into a decorative fragrance website. Translate the brand into an enterprise product.

## Priority 5 — UX prototyping assumptions in this document

The uploaded scope is not a field-level database specification.

Fields added below for mock forms and tables are **prototype assumptions** designed to make the frontend complete and convincing. They are not backend commitments.

---

# 3. Conflict Resolution Notes

## Brand name

Use:

**Flair Cosmetic & Fragrance**

Do not use older working names from proposal/sitemap artifacts in visible UI.

Application title:

**Flair ERP**

Optional supporting text:

**Operations Platform**

## SKU count

Older project material references 3,000+ SKUs, while the current public Flair site describes a 5,000+ SKU business.

Module 01 does not need a hard SKU count.

Therefore:

- do not place a prominent SKU count in Module 01,
- if a small business-context label is required, use neutral wording such as:
  - "Large multi-brand catalog"
  - "Retail, wholesale & e-commerce operations"

---

# 4. Non-Negotiable Scope

## Build

Build:

- reusable ERP application shell,
- responsive sidebar,
- responsive topbar,
- Core Setup Overview,
- Stores & Warehouses,
- Users & Roles,
- Permissions,
- Company Settings,
- frontend-only CRUD-like interactions,
- polished dialogs / sheets / drawers,
- notifications popover,
- global command search,
- profile menu,
- local dummy persistence,
- reset demo data flow,
- empty/loading/success states where relevant.

## Show, but do not implement

Display Modules 02–09 in the sidebar:

2. Product & Inventory
3. Retail POS
4. Purchasing & Vendors
5. Wholesale & B2B Portal
6. E-Commerce Hub
7. Reports & Dashboards
8. Smart Demand Forecasting
9. Accounting & Finance

They must be visually present but unavailable.

## Do not build

Do not build:

- backend,
- database,
- authentication service,
- API routes,
- Server Actions for data mutation,
- real email invitations,
- real permission enforcement,
- real maps,
- real warehouse integrations,
- inventory features from Module 02,
- real file uploads,
- real audit backend,
- e-commerce integrations,
- finance logic,
- forecasting logic.

---

# 5. Definition of Done

The loop stops only when all of the following are true.

## Product

- [ ] Module 01 is the only active ERP module.
- [ ] All four source-defined Module 01 areas are implemented.
- [ ] A polished Core Setup overview page exists as the module landing experience.
- [ ] Modules 02–09 appear in the sidebar and cannot navigate.
- [ ] Disabled modules communicate phase / coming-soon status clearly.
- [ ] All primary create/edit flows use polished modal, sheet, or drawer UI.
- [ ] Delete / destructive actions use confirmation.
- [ ] Dummy actions update the UI immediately.
- [ ] Demo changes survive browser refresh through local persistence.
- [ ] A reset-to-seed-data action exists.
- [ ] No interaction creates a broken route.

## Visual

- [ ] The design clearly feels related to Flair, not a default shadcn starter.
- [ ] Brand tokens are extracted from the live site before final polish.
- [ ] Sidebar, topbar, cards, forms, tables, states, and dialogs share one system.
- [ ] Desktop layout is excellent at 1440px and 1280px.
- [ ] Tablet layout is excellent around 1024px and 768px.
- [ ] Mobile layout is excellent around 430px, 390px, and 360px.
- [ ] No horizontal page overflow.
- [ ] Tables transform gracefully on mobile.
- [ ] No cramped modal content on small screens.
- [ ] Density is professional, not oversized.
- [ ] Motion is subtle and intentional.

## Engineering

- [ ] `pnpm build` passes.
- [ ] TypeScript passes.
- [ ] ESLint passes.
- [ ] No browser console errors.
- [ ] No hydration warnings.
- [ ] No missing keys.
- [ ] No uncontrolled / controlled input warnings.
- [ ] No dead buttons.
- [ ] No fake network requests.
- [ ] Data structures are typed.
- [ ] Page-level components are not monolithic.
- [ ] UI primitives are reusable.
- [ ] Client components are used only where interaction requires them.

## Accessibility

- [ ] Keyboard navigation works for navigation, menus, dialogs, tabs, forms, and tables.
- [ ] Dialogs have titles and descriptions.
- [ ] Icon buttons have accessible labels.
- [ ] Form inputs have real labels.
- [ ] Error messages are readable.
- [ ] Focus rings are visible.
- [ ] Color is not the only carrier of status.
- [ ] Reduced motion is respected.

---

# 6. Required Technology

Use the current stable versions available at implementation time.

At the time this specification was prepared:

- **Next.js 16.3.3** is the Active LTS security-patched release.
- Use **App Router**.
- Use **TypeScript**.
- Use **Tailwind CSS**.
- Use **shadcn/ui latest CLI and components**.
- Use shadcn with a stable accessible primitive base, preferably **Radix** unless the project has an explicit alternative preset.

Recommended supporting packages:

- `lucide-react`
- `@tanstack/react-table`
- `react-hook-form`
- `zod`
- `@hookform/resolvers`
- `zustand`
- `recharts` or shadcn chart wrappers
- `sonner`
- `date-fns`

Do not add a large dependency when a shadcn or native solution already exists.

---

# 7. Recommended Setup

Use `pnpm`.

Example initialization:

```bash
pnpm create next-app@latest flair-erp \
  --ts \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

Initialize shadcn:

```bash
pnpm dlx shadcn@latest init -t next --base radix
```

Install only components actually used.

Recommended shadcn components:

```text
alert
alert-dialog
avatar
badge
breadcrumb
button
calendar
card
checkbox
command
dialog
drawer
dropdown-menu
form
input
label
popover
progress
radio-group
scroll-area
select
separator
sheet
sidebar
skeleton
sonner
switch
table
tabs
textarea
tooltip
```

If the current shadcn release provides a better canonical component for an item, use it.

---

# 8. Autonomous Loop Contract

This is a **build → inspect → verify → improve** loop.

## Maximum loop count

Use a maximum of **10 implementation loops**.

Do not loop indefinitely.

## Every loop must

1. Re-read the active acceptance checklist.
2. Pick the highest-impact incomplete group.
3. Implement that group.
4. Run static checks.
5. Open the app and inspect the affected views.
6. Fix obvious layout, interaction, or console defects.
7. Update the internal task checklist.
8. Continue only if Definition of Done is not satisfied.

## Suggested loop sequence

### Loop 1 — Foundation
- scaffold app,
- install shadcn,
- establish design tokens,
- create types,
- create mock store,
- create base shell.

### Loop 2 — Brand translation
- inspect live Flair site,
- capture official logo asset if available,
- derive palette and typography,
- create local brand token layer,
- build final sidebar/topbar language.

### Loop 3 — Core Overview
- build Core Setup landing page,
- KPIs,
- setup health,
- quick actions,
- recent activity,
- location summary,
- role distribution.

### Loop 4 — Stores & Warehouses
- table/cards,
- filters,
- add/edit/detail/delete flows,
- responsive states.

### Loop 5 — Users & Roles
- user table,
- role cards,
- add/edit/detail/deactivate flows,
- mobile treatment.

### Loop 6 — Permissions
- role selector,
- access matrix,
- visibility controls,
- location scope,
- presets,
- save state.

### Loop 7 — Company Settings
- settings summaries,
- edit dialogs,
- branding preview,
- operational defaults,
- reset demo data.

### Loop 8 — Global UX
- command palette,
- notifications,
- profile dropdown,
- quick-add menu,
- toasts,
- skeletons,
- empty states.

### Loop 9 — Responsive & accessibility QA
- desktop,
- tablet,
- mobile,
- keyboard,
- focus,
- long content,
- modal overflow.

### Loop 10 — Final polish
- spacing,
- typography,
- motion,
- empty details,
- console,
- build,
- final acceptance pass.

If all requirements are met before Loop 10, stop.

---

# 9. Brand Extraction Protocol

Before finalizing visual tokens, inspect:

- `https://flairperfumes.com/`
- `https://flairperfumes.com/pages/about-us`

## Extract and record

Capture:

1. official logo / wordmark,
2. primary navigation colors,
3. background colors,
4. text colors,
5. button styles,
6. border radius tendencies,
7. typography style,
8. visual spacing,
9. image treatment,
10. brand tone.

If possible, inspect actual computed CSS in the browser.

## Brand principles to preserve

Use the brand's current positioning as an emotional guide:

- authenticity,
- integrity,
- transparent value,
- reliable operations,
- premium but approachable,
- long-term trust.

## Visual translation into ERP

### Use

- strong dark ink / charcoal for the navigation shell,
- warm neutral content canvas,
- restrained champagne / amber / premium accent derived from the real brand,
- white / ivory cards,
- soft warm border tones,
- meaningful status colors,
- premium photography only where it supports context,
- elegant typography with excellent data legibility.

### Avoid

- turning every surface gold,
- heavy perfume ad aesthetics inside data tables,
- excessive glassmorphism,
- neon colors,
- cyberpunk styling,
- overly rounded toy-like UI,
- decorative gradients on every card,
- huge dashboard headings,
- generic blue SaaS appearance,
- pink ERP styling inherited from proposal presentation artwork.

The pink in the proposal deck is **proposal branding**, not necessarily Flair brand identity.

## Fallback visual direction only if live brand extraction is blocked

Use this only as a temporary fallback, not as verified brand values:

```css
--brand-ink: #171614;
--brand-charcoal: #23211f;
--brand-ivory: #faf7f1;
--brand-paper: #ffffff;
--brand-champagne: #c4a26a;
--brand-amber: #a66a2c;
--brand-rose: #9e6b68;
--brand-moss: #334033;
--brand-border: #e8e1d8;
--brand-muted: #7d766e;
```

Replace fallback values with extracted live-site values before final delivery.

---

# 10. Typography

Typography must prioritize enterprise readability.

## Recommended system

Use:

- a clean modern sans-serif for application UI,
- optionally a restrained display/serif accent only for brand moments such as the app splash / Core Setup hero label if it genuinely matches Flair.

Do not use script fonts inside the application UI.

Recommended UI characteristics:

- headings: medium to semibold,
- body: regular,
- labels: medium,
- table data: regular / medium,
- numeric KPIs: semibold,
- tracking: tight to normal,
- no excessive uppercase.

## Suggested scale

```text
Page title:       28–32px desktop / 24px mobile
Section title:    18–20px
Card title:       14–16px
Body:             14px
Table text:       13–14px
Label:            12–13px
Meta/caption:     11–12px
KPI number:       28–34px
```

---

# 11. Layout System

## Desktop shell

Use a two-part shell:

```text
┌──────────────────────────────────────────────────────────────┐
│ Sidebar │ Topbar                                            │
│         ├────────────────────────────────────────────────────┤
│         │ Main content                                      │
│         │                                                    │
└──────────────────────────────────────────────────────────────┘
```

Recommended desktop sidebar:

- expanded width: 272–288px,
- collapsed width: 76–84px,
- sticky / fixed full-height,
- deep brand ink background,
- visible Flair logo at top,
- compact organization label,
- module navigation below,
- profile / support area near bottom.

Main content:

- max-width should not feel boxed in,
- comfortable 24–32px desktop padding,
- 16–20px mobile padding,
- content should fill large displays intelligently,
- avoid fixed `max-w-5xl` for data-heavy pages.

## Tablet

At medium widths:

- collapse sidebar to icon rail or use a sheet,
- retain sticky topbar,
- preserve accessible module labels via tooltip,
- reduce card gaps rather than merely shrinking text.

## Mobile

- sidebar becomes shadcn `Sheet`,
- topbar contains menu trigger,
- title / breadcrumb compress intelligently,
- quick-add becomes icon or compact button,
- tables become stacked record cards when needed,
- large dialogs switch to `Drawer` or full-height sheet,
- forms become one column,
- sticky mobile action footer may be used for long forms.

---

# 12. App Shell

Create these reusable shell components.

## `AppSidebar`

Contains:

- Flair logo,
- "ERP Operations" supporting label,
- Module 01 enabled,
- Modules 02–09 disabled,
- Phase dividers,
- module icons,
- module number,
- optional phase label,
- flagship marker for Smart Demand Forecasting,
- collapse control.

## `AppTopbar`

Contains:

Left:

- mobile nav trigger where needed,
- breadcrumb,
- page title on compact layouts if appropriate.

Right:

- global search trigger,
- quick-add button,
- notifications,
- optional theme control if implemented,
- user profile menu.

## `GlobalCommandMenu`

Keyboard shortcut:

- `⌘ K` on macOS,
- `Ctrl K` elsewhere.

Search dummy entities from active Module 01:

- locations,
- users,
- roles,
- settings sections.

Also show disabled modules as non-navigable search results labeled "Coming later".

## `NotificationPopover`

Seed with useful operational notifications.

Examples:

- "2 users have not signed in this month"
- "E-Commerce Fulfillment Hub profile needs a manager"
- "Permission policy updated for Procurement"
- "Company profile was edited today"

Mark read / unread locally.

## `QuickAddMenu`

Menu actions:

- Add location
- Add user
- Create role
- Open permission preset
- Edit business profile

Each action opens its corresponding popup without requiring route navigation.

---

# 13. Sidebar Information Architecture

## Module 01 — enabled

**Core Setup**

Expanded child navigation:

- Overview
- Stores & Warehouses
- Users & Roles
- Permissions
- Company Settings

Routes:

```text
/core-setup
/core-setup/stores-warehouses
/core-setup/users-roles
/core-setup/permissions
/core-setup/company-settings
```

`/` should redirect to `/core-setup`.

## Phase 1 — disabled

### 02 Product & Inventory
Subtitle:
`One catalog, real-time stock`

### 03 Retail POS
Subtitle:
`Point-of-sale for store counters`

### 04 Purchasing & Vendors
Subtitle:
`From order to vendor bill`

## Phase 2 — disabled

### 05 Wholesale & B2B Portal
Subtitle:
`Self-service ordering for resellers`

### 06 E-Commerce Hub
Subtitle:
`Connected sales channels`

### 07 Reports & Dashboards
Subtitle:
`See the business at a glance`

## Phase 3 — disabled

### 08 Smart Demand Forecasting
Subtitle:
`AI-assisted purchase planning`

Add a small:
`FLAGSHIP`

badge.

### 09 Accounting & Finance
Subtitle:
`Books that stay in sync with operations`

## Disabled module behavior

Do not use an actual `<Link>` for unavailable routes.

Use an element that:

- has `aria-disabled="true"`,
- does not navigate,
- supports a tooltip,
- can show a small lock / clock icon,
- displays:
  - `Coming in Phase 1`
  - `Coming in Phase 2`
  - `Coming in Phase 3`

On click, optionally show a compact toast:

`This module is included in the roadmap and is not part of the current frontend build.`

Do not create blank placeholder pages for Modules 02–09.

---

# 14. Core Setup Overview

Route:

```text
/core-setup
```

Purpose:

Provide a premium landing dashboard for Module 01.

This page is an additive UX layer that summarizes the four source-defined Core Setup areas.

## Header

Breadcrumb:

`ERP / Core Setup`

Title:

**Core Setup**

Description:

`Configure locations, people, permissions and the business settings that power every future module.`

Primary CTA:

`Quick add`

Secondary subtle action:

`Reset demo`

Use a confirmation dialog for reset.

## Hero / readiness card

Create a sophisticated setup-readiness panel.

Content example:

**Foundation ready**
`Core Setup is 86% configured`

Progress categories:

- Locations — Complete
- Users — Complete
- Roles — Complete
- Permissions — Review needed
- Company profile — Complete

Show:

- progress ring or progress bar,
- small "No dependencies" label,
- short explanation:
  `Core Setup is the foundation for inventory, POS, purchasing and the rest of the platform.`

## KPI row

Recommended cards:

### Locations
Value:
`6`

Meta:
`3 retail · 3 warehouse`

### Active staff
Value:
`22`

Meta:
`2 invited · 1 inactive`

### Roles
Value:
`6`

Meta:
`Source-defined operating roles`

### Access policies
Value:
`42`

Meta:
`Across modules and data visibility`

KPI cards should be useful, not decorative.

## Location network card

Show:

- location image thumbnails,
- name,
- code,
- type,
- status,
- manager,
- staff count.

Display top 4 with:
`View all locations`

No real map is required.

## Role distribution chart

Use shadcn chart / Recharts.

Example counts:

- Admin — 3
- Accountant — 2
- Procurement — 3
- Sales — 6
- Inventory — 4
- Cashier — 6

Chart should:

- have a concise legend,
- remain legible on mobile,
- not use random rainbow colors,
- derive tones from the brand plus accessible semantic colors.

## Recent setup activity

Timeline examples:

- `Maya Patel` updated the Procurement permission policy
- `Daniel Brooks` added E-Commerce Fulfillment Hub
- `Admin` changed the default timezone
- `Olivia Chen` activated a new Cashier user
- `System` generated the initial role templates

Each item:

- avatar/icon,
- action,
- entity,
- timestamp,
- subtle category badge.

## Quick actions panel

Buttons:

- Add location
- Add user
- Create role
- Review permissions

Each launches popup / context immediately.

## Platform roadmap card

Show all nine modules in a compact roadmap.

Module 01:
`Active`

Modules 02–09:
`Planned`

This helps demonstrate scalability without making them interactive.

---

# 15. Stores & Warehouses Page

Route:

```text
/core-setup/stores-warehouses
```

Source purpose:

- add / edit locations,
- identify warehouse type:
  - retail,
  - main,
  - e-commerce.

## Page header

Title:

**Stores & Warehouses**

Description:

`Manage the physical locations that define how Flair operates across retail and fulfillment.`

Primary CTA:

`Add location`

## Summary row

Cards:

- Total locations
- Retail stores
- Warehouses
- Active locations

## Toolbar

Include:

- search,
- type filter,
- status filter,
- city filter,
- view toggle:
  - table
  - cards
- clear filters.

Desktop should default to table.
Mobile should default to cards.

## Tabs

Recommended:

- All
- Retail
- Warehouses

Do not duplicate unnecessary controls.

## Desktop table columns

- Location
- Code
- Type
- City
- Manager
- Staff
- Status
- Updated
- Actions

Location cell includes:

- thumbnail,
- name,
- optional compact address.

Type badges:

- Retail Store
- Main Warehouse
- E-Commerce Warehouse

Status badges:

- Active
- Setup
- Inactive

## Row actions

- View details
- Edit
- Duplicate
- Mark inactive / activate
- Delete

Delete uses AlertDialog.

## Add Location popup

Desktop:

- large `Dialog`

Mobile:

- `Drawer` or near-full-height `Sheet`

Title:

**Add location**

Step / section structure:

### Section 1 — Basics
- Location name
- Location code
- Location type
- Status

### Section 2 — Address
- Address line 1
- Address line 2
- City
- State
- ZIP code
- Country

### Section 3 — Operations
- Manager
- Phone
- Email
- Timezone
- Default opening time
- Default closing time

### Section 4 — Warehouse details
Show only for warehouse types:

- warehouse classification:
  - main
  - e-commerce
- fulfillment enabled
- approximate capacity
- linked retail store
- notes

### Section 5 — Image
Frontend-only image picker:

- file preview,
- fake upload state,
- fallback demo image.

Do not actually upload to a server.

Actions:

- Cancel
- Add location

On success:

- add to store,
- toast:
  `Location added`
- close popup.

## Edit Location popup

Reuse the same form component.

Title:

`Edit {Location Name}`

Prefill data.

Save updates immediately.

## Location Details sheet

Right-side sheet on desktop.

Full-screen / large sheet on mobile.

Display:

- image,
- type,
- status,
- contact,
- address,
- manager,
- staff count,
- operational tags,
- last updated,
- activity log.

Actions:

- Edit
- Duplicate
- Change status

## Validation

Required:

- name,
- code,
- type,
- status,
- city,
- state,
- country.

Location code:

- uppercase,
- 2–10 characters,
- unique in current mock state.

---

# 16. Users & Roles Page

Route:

```text
/core-setup/users-roles
```

Source purpose:

- staff accounts,
- role assignment for:
  - Admin
  - Accountant
  - Procurement
  - Sales
  - Inventory
  - Cashier

## Page header

Title:

**Users & Roles**

Description:

`Manage staff access, role assignment and location coverage across the ERP.`

Primary CTA:

`Add user`

Secondary CTA:

`Create role`

## Top summary

Cards:

- Total users
- Active
- Invited
- Roles

## Main tabs

- Users
- Roles

Persist selected tab in URL query or local state if useful.

---

## 16.1 Users tab

### Toolbar

- search,
- role filter,
- location filter,
- status filter,
- clear,
- compact "Add user".

### User table

Columns:

- User
- Employee ID
- Role
- Locations
- Status
- Last active
- Added
- Actions

User cell:

- avatar,
- full name,
- email.

Status:

- Active
- Invited
- Inactive

### Add User popup

Fields:

#### Identity
- First name
- Last name
- Employee ID
- Email
- Phone

#### Access
- Role
- Assigned locations
- Status

#### Preferences
- Timezone
- Receive operational notifications
- Require password reset on first sign in
- MFA state for display only

Since auth is not real:

- "Invite user" means add a mock user with status `Invited`.
- no email is sent.

Button:

`Add user`

Toast:

`User added to demo workspace`

### Edit User popup

Same form, prefilled.

### User detail sheet

Show:

- avatar,
- full identity,
- role,
- assigned locations,
- status,
- last activity,
- account created,
- permission summary,
- recent setup activity.

Actions:

- Edit
- Change role
- Deactivate / activate

### Deactivate flow

AlertDialog:

`Deactivate this user?`

Explain:

`This changes demo access state only. No real account is affected.`

---

## 16.2 Roles tab

Show six primary role cards.

### Admin

Description:

`Full configuration visibility for the ERP foundation.`

### Accountant

Description:

`Financial visibility with limited operational configuration.`

### Procurement

Description:

`Purchasing-oriented access with relevant cost visibility.`

### Sales

Description:

`Sales-focused access without unrestricted financial controls.`

### Inventory

Description:

`Warehouse and stock-oriented access.`

### Cashier

Description:

`Retail counter access with narrow configuration permissions.`

Each role card shows:

- icon,
- role name,
- user count,
- access level label,
- top permission chips,
- locations covered,
- menu.

Actions:

- View permissions
- Edit role
- Duplicate role

Default source roles should not be deletable in the demo.

### Create Role popup

This is an additive prototype feature for demonstrating extensibility.

Fields:

- Role name
- Description
- Base role template
- Default location scope
- Permission preset

Create custom roles as:
`Custom`

badge.

Allow deleting only custom roles.

---

# 17. Permissions Page

Route:

```text
/core-setup/permissions
```

Source purpose:

- module-level access control,
- data visibility rules for:
  - pricing,
  - purchasing,
  - accounting,
  - reports.

This page must feel powerful and enterprise-grade.

## Header

Title:

**Permissions**

Description:

`Control what each role can access, change and view across the platform.`

Primary action:

`Save changes`

Secondary:

`Apply preset`

## Role selector

Use a strong role picker at top.

Options:

- Admin
- Accountant
- Procurement
- Sales
- Inventory
- Cashier
- any custom role created in the demo.

Show selected role summary:

- users assigned,
- location scope,
- policy last updated.

## Unsaved state

When a toggle changes:

- show `Unsaved changes`,
- enable Save,
- optionally sticky save bar on small screens.

## Permission matrix

Show all nine modules even though only Module 01 is implemented.

This reflects role design for the future ERP without making those module screens available.

Columns:

- Module
- View
- Create
- Edit
- Delete
- Approve
- Export

Rows:

1. Core Setup
2. Product & Inventory
3. Retail POS
4. Purchasing & Vendors
5. Wholesale & B2B Portal
6. E-Commerce Hub
7. Reports & Dashboards
8. Smart Demand Forecasting
9. Accounting & Finance

For Modules 02–09:

- controls may still be toggled because this is policy configuration,
- display a subtle `Future module` badge.

Use indeterminate / parent controls if appropriate.

## Data visibility section

Source-required data visibility controls:

- View pricing
- View product cost
- View purchasing
- View accounting
- View reports

Add clear descriptions.

Example:

**View pricing**
`Allows display of selling prices and price-related fields.`

**View product cost**
`Allows cost and margin-related fields where those modules exist.`

**View purchasing**
`Allows purchase-order and vendor purchasing information.`

**View accounting**
`Allows accounting and ledger information.`

**View reports**
`Allows business reporting and dashboards.`

## Location scope

Radio:

- All locations
- Selected locations

If selected:

- multi-select locations.

## Permission presets

Popup:

**Apply permission preset**

Presets:

- Full access
- Finance focused
- Procurement focused
- Sales focused
- Inventory focused
- Retail cashier

Show impact summary before apply.

Confirm:

`Apply preset`

## Permission preview

Add a small panel:

**What this role can currently do**

Example for Cashier:

- Access Retail POS when Module 03 launches
- View assigned retail location
- Cannot view cost
- Cannot access accounting
- Cannot export reports

This makes permissions easier to understand than a matrix alone.

---

# 18. Company Settings Page

Route:

```text
/core-setup/company-settings
```

Source purpose:

- general configuration,
- business profile.

Do not make this one giant edit form.

Use polished settings summary cards.
Each card has its own `Edit` action opening a focused popup.

## Header

Title:

**Company Settings**

Description:

`Manage the business profile and core defaults used across the Flair ERP experience.`

## Settings cards

---

## 18.1 Business Profile card

Display:

- logo,
- business name,
- legal/display name,
- website,
- phone,
- email,
- address.

Seed public business details from the current Flair website:

- Display name: Flair Cosmetic & Fragrance
- Website: flairperfumes.com
- Email: info@flairperfumes.com
- Phone: 940-353-5247
- Store address: 6701 Harwin Dr, Suite #109, Houston, TX 77036

Edit popup fields:

- Display name
- Legal name
- Website
- Email
- Phone
- Address
- Business description

---

## 18.2 Branding card

Display:

- app logo preview,
- favicon preview,
- selected accent color,
- app display name.

Edit popup:

- logo picker with local preview,
- wordmark variant,
- accent token selector,
- app display name.

The official Flair logo should be sourced from the live brand site when technically accessible.

Do not redraw or alter an official logo unnecessarily.

---

## 18.3 Regional & Format card

Display:

- Currency: USD
- Timezone: America/Chicago
- Date format: MM/DD/YYYY
- Time format: 12-hour
- Language: English

Edit popup with selects.

---

## 18.4 Operational Defaults card

Display:

- default retail location,
- default main warehouse,
- default e-commerce warehouse,
- default user status,
- location code pattern.

Edit popup.

Do not imply these settings are backend-enforced.

---

## 18.5 Notification Defaults card

Controls:

- access change notifications,
- new user notifications,
- location setup reminders,
- weekly configuration digest.

Edit popup.

---

## 18.6 Demo Workspace card

Explain:

`This first module is a frontend prototype. Changes are stored in this browser only.`

Actions:

- Reset demo data
- Clear local demo state

Both require confirmation.

---

# 19. Popup UX Rules

The user specifically wants professional popups for adding and editing data.

Use the following system.

## Dialog

Use for:

- add location,
- edit location,
- add user,
- edit user,
- create role,
- edit role,
- permission preset,
- focused company settings edit.

## Sheet

Use for:

- location details,
- user details,
- long inspection / preview style panels,
- full context without leaving the list.

## Drawer

Use on mobile when a large desktop dialog would feel cramped.

## AlertDialog

Use for:

- delete,
- deactivate,
- reset demo data,
- destructive permission resets.

## Popover / Dropdown

Use for:

- filters,
- row menus,
- notifications,
- quick add,
- small selectors.

## Modal visual standard

All modals must:

- have a real title,
- have a short description,
- use clear section grouping,
- keep labels visible,
- use one primary action,
- have a clear cancel action,
- fit within viewport,
- scroll internally when needed,
- never place critical buttons offscreen,
- show disabled/loading state when submitting,
- close only after successful local update,
- show a toast after mutation.

---

# 20. Dummy Data Strategy

All data is synthetic except public Flair business profile details sourced from the official website.

Store seed data in typed files.

Recommended:

```text
src/data/mock/locations.ts
src/data/mock/users.ts
src/data/mock/roles.ts
src/data/mock/permissions.ts
src/data/mock/activity.ts
src/data/mock/notifications.ts
src/data/mock/company-settings.ts
```

Use realistic timestamps relative to a fixed seed date or generate deterministic values to avoid hydration issues.

---

# 21. Seed Location Data

Use six demo locations.

Clearly keep non-public branch details fictional.

```ts
[
  {
    id: "loc-harwin",
    name: "Harwin Flagship Store",
    code: "HOU-RT01",
    type: "retail",
    status: "active",
    city: "Houston",
    state: "TX",
    country: "USA",
    address1: "6701 Harwin Dr, Suite #109",
    zip: "77036",
    manager: "Maya Patel",
    phone: "940-353-5247",
    email: "houston@demo.flair.local",
    timezone: "America/Chicago",
    staffCount: 8,
    image: "/demo/locations/harwin-store.webp",
    note: "Public Flair store address; contact email is demo-only."
  },
  {
    id: "loc-main-wh",
    name: "Houston Main Warehouse",
    code: "HOU-MW01",
    type: "main-warehouse",
    status: "active",
    city: "Houston",
    state: "TX",
    country: "USA",
    address1: "Harwin District — Demo Facility",
    zip: "77036",
    manager: "Noah Williams",
    phone: "(713) 555-0131",
    email: "mainwarehouse@demo.flair.local",
    timezone: "America/Chicago",
    staffCount: 6,
    capacityLabel: "78% utilized",
    image: "/demo/locations/main-warehouse.webp",
    fictional: true
  },
  {
    id: "loc-ecom-wh",
    name: "E-Commerce Fulfillment Hub",
    code: "HOU-EC01",
    type: "ecommerce-warehouse",
    status: "active",
    city: "Houston",
    state: "TX",
    country: "USA",
    address1: "West Houston — Demo Facility",
    zip: "77042",
    manager: "Avery Morgan",
    phone: "(713) 555-0142",
    email: "ecom@demo.flair.local",
    timezone: "America/Chicago",
    staffCount: 4,
    capacityLabel: "64% utilized",
    image: "/demo/locations/ecom-warehouse.webp",
    fictional: true
  },
  {
    id: "loc-dallas-retail",
    name: "Dallas Retail Store",
    code: "DAL-RT01",
    type: "retail",
    status: "setup",
    city: "Dallas",
    state: "TX",
    country: "USA",
    address1: "North Dallas — Demo Location",
    zip: "75229",
    manager: "Sophia Reed",
    phone: "(214) 555-0168",
    email: "dallas@demo.flair.local",
    timezone: "America/Chicago",
    staffCount: 3,
    image: "/demo/locations/dallas-store.webp",
    fictional: true
  },
  {
    id: "loc-overflow",
    name: "Dallas Overflow Warehouse",
    code: "DAL-OW01",
    type: "main-warehouse",
    status: "setup",
    city: "Dallas",
    state: "TX",
    country: "USA",
    address1: "Northwest Dallas — Demo Facility",
    zip: "75247",
    manager: "Ethan Carter",
    phone: "(214) 555-0184",
    email: "overflow@demo.flair.local",
    timezone: "America/Chicago",
    staffCount: 2,
    capacityLabel: "22% utilized",
    image: "/demo/locations/overflow-warehouse.webp",
    fictional: true
  },
  {
    id: "loc-returns",
    name: "Returns & Quality Center",
    code: "HOU-QA01",
    type: "main-warehouse",
    status: "inactive",
    city: "Houston",
    state: "TX",
    country: "USA",
    address1: "Southwest Houston — Demo Facility",
    zip: "77074",
    manager: "Unassigned",
    phone: "(713) 555-0193",
    email: "quality@demo.flair.local",
    timezone: "America/Chicago",
    staffCount: 1,
    capacityLabel: "Inactive",
    image: "/demo/locations/returns-center.webp",
    fictional: true
  }
]
```

---

# 22. Seed Role Data

Use these six source-defined roles.

```ts
[
  {
    id: "role-admin",
    name: "Admin",
    sourceRole: true,
    userCount: 3,
    accessLevel: "Full",
    description: "Platform-wide configuration and access management."
  },
  {
    id: "role-accountant",
    name: "Accountant",
    sourceRole: true,
    userCount: 2,
    accessLevel: "Finance",
    description: "Financial and accounting-oriented visibility."
  },
  {
    id: "role-procurement",
    name: "Procurement",
    sourceRole: true,
    userCount: 3,
    accessLevel: "Operational",
    description: "Vendor, purchasing and cost-oriented operations."
  },
  {
    id: "role-sales",
    name: "Sales",
    sourceRole: true,
    userCount: 6,
    accessLevel: "Commercial",
    description: "Sales operations with restricted financial visibility."
  },
  {
    id: "role-inventory",
    name: "Inventory",
    sourceRole: true,
    userCount: 4,
    accessLevel: "Operational",
    description: "Warehouse and inventory-focused access."
  },
  {
    id: "role-cashier",
    name: "Cashier",
    sourceRole: true,
    userCount: 6,
    accessLevel: "Restricted",
    description: "Retail counter access with minimal configuration permissions."
  }
]
```

---

# 23. Seed User Data

Use synthetic people only.

```ts
[
  {
    id: "usr-001",
    firstName: "Maya",
    lastName: "Patel",
    employeeId: "FLR-1001",
    email: "maya.patel@demo.flair.local",
    phone: "(713) 555-0101",
    roleId: "role-admin",
    locationIds: ["loc-harwin", "loc-main-wh"],
    status: "active",
    lastActive: "10 min ago",
    addedAt: "2026-06-12",
    avatar: "/demo/avatars/avatar-01.svg"
  },
  {
    id: "usr-002",
    firstName: "Daniel",
    lastName: "Brooks",
    employeeId: "FLR-1002",
    email: "daniel.brooks@demo.flair.local",
    phone: "(713) 555-0102",
    roleId: "role-admin",
    locationIds: ["loc-harwin"],
    status: "active",
    lastActive: "34 min ago",
    addedAt: "2026-05-03",
    avatar: "/demo/avatars/avatar-02.svg"
  },
  {
    id: "usr-003",
    firstName: "Olivia",
    lastName: "Chen",
    employeeId: "FLR-1010",
    email: "olivia.chen@demo.flair.local",
    phone: "(713) 555-0110",
    roleId: "role-accountant",
    locationIds: ["loc-harwin"],
    status: "active",
    lastActive: "1 hr ago",
    addedAt: "2026-02-14",
    avatar: "/demo/avatars/avatar-03.svg"
  },
  {
    id: "usr-004",
    firstName: "Noah",
    lastName: "Williams",
    employeeId: "FLR-1014",
    email: "noah.williams@demo.flair.local",
    phone: "(713) 555-0114",
    roleId: "role-inventory",
    locationIds: ["loc-main-wh"],
    status: "active",
    lastActive: "18 min ago",
    addedAt: "2026-03-21",
    avatar: "/demo/avatars/avatar-04.svg"
  },
  {
    id: "usr-005",
    firstName: "Avery",
    lastName: "Morgan",
    employeeId: "FLR-1018",
    email: "avery.morgan@demo.flair.local",
    phone: "(713) 555-0118",
    roleId: "role-inventory",
    locationIds: ["loc-ecom-wh"],
    status: "active",
    lastActive: "2 hrs ago",
    addedAt: "2026-04-10",
    avatar: "/demo/avatars/avatar-05.svg"
  },
  {
    id: "usr-006",
    firstName: "Sophia",
    lastName: "Reed",
    employeeId: "FLR-1022",
    email: "sophia.reed@demo.flair.local",
    phone: "(214) 555-0122",
    roleId: "role-sales",
    locationIds: ["loc-dallas-retail"],
    status: "active",
    lastActive: "Yesterday",
    addedAt: "2026-07-04",
    avatar: "/demo/avatars/avatar-06.svg"
  },
  {
    id: "usr-007",
    firstName: "Ethan",
    lastName: "Carter",
    employeeId: "FLR-1024",
    email: "ethan.carter@demo.flair.local",
    phone: "(214) 555-0124",
    roleId: "role-procurement",
    locationIds: ["loc-main-wh", "loc-overflow"],
    status: "active",
    lastActive: "3 hrs ago",
    addedAt: "2026-01-19",
    avatar: "/demo/avatars/avatar-07.svg"
  },
  {
    id: "usr-008",
    firstName: "Layla",
    lastName: "Ahmed",
    employeeId: "FLR-1028",
    email: "layla.ahmed@demo.flair.local",
    phone: "(713) 555-0128",
    roleId: "role-procurement",
    locationIds: ["loc-main-wh", "loc-ecom-wh"],
    status: "active",
    lastActive: "42 min ago",
    addedAt: "2026-02-02",
    avatar: "/demo/avatars/avatar-08.svg"
  },
  {
    id: "usr-009",
    firstName: "Lucas",
    lastName: "Martin",
    employeeId: "FLR-1030",
    email: "lucas.martin@demo.flair.local",
    phone: "(713) 555-0130",
    roleId: "role-cashier",
    locationIds: ["loc-harwin"],
    status: "active",
    lastActive: "7 min ago",
    addedAt: "2026-06-23",
    avatar: "/demo/avatars/avatar-09.svg"
  },
  {
    id: "usr-010",
    firstName: "Zoe",
    lastName: "Rivera",
    employeeId: "FLR-1031",
    email: "zoe.rivera@demo.flair.local",
    phone: "(713) 555-0132",
    roleId: "role-cashier",
    locationIds: ["loc-harwin"],
    status: "invited",
    lastActive: "Never",
    addedAt: "2026-08-28",
    avatar: "/demo/avatars/avatar-10.svg"
  },
  {
    id: "usr-011",
    firstName: "Henry",
    lastName: "Scott",
    employeeId: "FLR-1035",
    email: "henry.scott@demo.flair.local",
    phone: "(214) 555-0135",
    roleId: "role-sales",
    locationIds: ["loc-dallas-retail"],
    status: "invited",
    lastActive: "Never",
    addedAt: "2026-08-29",
    avatar: "/demo/avatars/avatar-11.svg"
  },
  {
    id: "usr-012",
    firstName: "Nora",
    lastName: "Lewis",
    employeeId: "FLR-1039",
    email: "nora.lewis@demo.flair.local",
    phone: "(713) 555-0139",
    roleId: "role-accountant",
    locationIds: ["loc-harwin"],
    status: "inactive",
    lastActive: "21 days ago",
    addedAt: "2025-11-18",
    avatar: "/demo/avatars/avatar-12.svg"
  }
]
```

Add more seed users programmatically if a fuller table is desired, but keep all identities synthetic.

---

# 24. Seed Permission Presets

Create presets.

## Admin

- all modules: view/create/edit/delete/approve/export
- all data visibility: on
- all locations

## Accountant

- Core Setup: view
- Accounting & Finance: full future access
- Reports: view/export
- pricing: on
- product cost: on
- purchasing: view
- accounting: on
- reports: on

## Procurement

- Core Setup: view
- Purchasing: full future access
- Product & Inventory: view/edit future access
- pricing: limited
- product cost: on
- purchasing: on
- accounting: off
- reports: limited

## Sales

- Core Setup: view
- Retail POS: future view/create
- Wholesale: future view/create/edit
- pricing: on
- product cost: off
- purchasing: off
- accounting: off
- reports: limited

## Inventory

- Core Setup: view
- Product & Inventory: future full operational access
- Purchasing: future view
- product cost: limited
- purchasing: limited
- accounting: off
- reports: limited

## Cashier

- Core Setup: minimal view
- Retail POS: future view/create
- pricing: selling price only
- product cost: off
- purchasing: off
- accounting: off
- reports: off

---

# 25. Seed Recent Activity

Create at least 12 items.

Examples:

```text
Maya Patel updated Procurement permissions
Daniel Brooks added E-Commerce Fulfillment Hub
Olivia Chen updated regional settings
Noah Williams changed Houston Main Warehouse status
Avery Morgan updated warehouse contact information
Sophia Reed was assigned to Dallas Retail Store
Ethan Carter reviewed location coverage
Layla Ahmed changed purchasing visibility
Lucas Martin signed into the demo workspace
Zoe Rivera was invited as Cashier
Admin reset notification preferences
System created source-defined role templates
```

Use timestamps spread across:

- minutes ago,
- hours ago,
- yesterday,
- this week.

---

# 26. Seed Notifications

At least 8.

Mix:

- unread,
- read,
- informational,
- attention needed.

Examples:

1. `Dallas Retail Store is still in setup status.`
2. `2 invited users have not activated demo access.`
3. `Procurement permissions changed today.`
4. `Main warehouse profile was updated.`
5. `Company timezone confirmed as America/Chicago.`
6. `Cashier role has restricted reporting access.`
7. `E-Commerce Fulfillment Hub has 4 assigned users.`
8. `Core Setup is ready for review.`

---

# 27. Image Asset Creation Manifest

The ERP needs restrained visual assets.

Do not fill the UI with unnecessary stock images.

## 27.1 Official brand assets

Create:

```text
/public/brand/flair-logo.*
/public/brand/flair-wordmark.*
/public/brand/flair-mark.*
```

Rules:

- source from the official Flair site if the asset is publicly accessible,
- keep aspect ratio,
- do not invent a replacement logo if official asset is available,
- do not modify logo colors without a brand-supported variant,
- optimize locally for the prototype.

If the exact asset cannot be extracted:

- use a clean text-based temporary `FLAIR` wordmark,
- clearly mark the file as placeholder,
- do not fabricate an "official" logo.

---

## 27.2 Location imagery

Create six local `.webp` images.

### `harwin-store.webp`

Prompt:

> Premium modern perfume and cosmetics retail interior in Houston, elegant dark shelving, warm ivory stone surfaces, amber accent lighting, neatly arranged fragrance bottles, upscale but approachable, realistic commercial interior photography, wide composition, no visible brand logos, no people, clean luxury retail environment.

### `main-warehouse.webp`

Prompt:

> Clean professional fragrance warehouse interior, organized shelves of boxed perfume inventory, modern warehouse aisles, barcode labels, warm neutral lighting, premium retail logistics environment, realistic commercial photography, highly organized, no visible trademarks, no people.

### `ecom-warehouse.webp`

Prompt:

> Modern e-commerce fulfillment workspace for perfume and beauty products, packing benches, compact shelves, labeled parcels, clean scanning station, refined enterprise logistics aesthetic, warm neutral palette with dark accents, realistic, no visible trademarks, no people.

### `dallas-store.webp`

Prompt:

> Contemporary luxury fragrance shop interior, elegant shelving, subtle champagne metallic details, warm cream walls, dark cabinetry, premium perfume retail experience, realistic wide commercial photograph, no visible logos, no people.

### `overflow-warehouse.webp`

Prompt:

> Secondary warehouse for fragrance and cosmetics distribution, clean pallet shelving, organized cartons, inventory labels, bright but premium industrial lighting, realistic operations photography, uncluttered, no people, no logos.

### `returns-center.webp`

Prompt:

> Small quality-control and returns workspace for fragrance products, inspection desk, neatly separated product boxes, clean shelving, quality check station, professional logistics environment, understated warm neutral palette, realistic, no people, no trademarks.

Image dimensions:

```text
1600 × 1000
```

Crop safely for:

- 16:10 cards,
- square thumbnail,
- 3:2 detail hero.

---

## 27.3 User avatars

Do not use photos of real public people.

Preferred:

Create 12 deterministic SVG avatars using:

- initials,
- abstract geometric shapes,
- subtle brand-derived color pairs,
- sufficient foreground/background contrast.

Files:

```text
avatar-01.svg
...
avatar-12.svg
```

Alternative:

Use generated fictional professional portraits only if image generation is intentionally part of the demo.

For an ERP prototype, initials-based SVG avatars are cleaner and safer.

---

## 27.4 Empty state illustrations

Create small local SVG illustrations for:

```text
empty-locations.svg
empty-users.svg
empty-search.svg
empty-notifications.svg
```

Style:

- line / simple geometric,
- brand accent,
- neutral fill,
- no childish cartoon style.

---

# 28. Data State Architecture

Use frontend-only local state.

Recommended:

`zustand`

Store namespace:

```text
flair-erp-demo:v1
```

Slices:

```ts
locations
users
roles
permissions
companySettings
activity
notifications
uiPreferences
```

Actions:

```ts
addLocation
updateLocation
duplicateLocation
deleteLocation
setLocationStatus

addUser
updateUser
setUserStatus

addRole
updateRole
duplicateRole
deleteCustomRole

updateRolePermissions
applyPermissionPreset

updateCompanySettings

markNotificationRead
markAllNotificationsRead

resetDemoData
```

Persist with a versioned local-storage layer.

## Hydration requirement

Avoid rendering persisted client-only values in a way that causes server/client mismatch.

Use one of:

- client-side hydrated provider,
- `skipHydration` pattern,
- a controlled loading shell before persisted state is ready.

No hydration warning is acceptable.

---

# 29. Types

Create strong domain types.

Example:

```ts
type LocationType =
  | "retail"
  | "main-warehouse"
  | "ecommerce-warehouse"

type RecordStatus =
  | "active"
  | "setup"
  | "inactive"

type UserStatus =
  | "active"
  | "invited"
  | "inactive"

type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "export"
```

Use real interfaces for:

- Location
- User
- Role
- ModulePermission
- PermissionPolicy
- CompanySettings
- ActivityItem
- NotificationItem

No `any`.

---

# 30. Forms

Use:

- React Hook Form
- Zod
- shadcn form components

## UX rules

- validate on submit,
- validate obvious duplicate codes before mutation,
- disable save during simulated submission,
- use 250–450ms simulated delay only if it improves perceived realism,
- do not add random multi-second delays,
- autofocus the first useful field,
- preserve typed values if validation fails,
- show concise error messages,
- use real select labels and descriptions.

---

# 31. Table System

Build a reusable DataTable layer.

Needs:

- search,
- filters,
- sorting,
- pagination or controlled page size,
- row actions,
- mobile alternate view.

Recommended page sizes:

- 10
- 20
- 50

For current seed data, default to 10.

## Desktop

- sticky header when helpful,
- no oversized row heights,
- 52–60px row height,
- ellipsis for long values,
- tooltips for truncated data.

## Mobile

Do not render a 9-column table and force sideways scrolling.

Use cards:

```text
[Avatar / image]  Name
                  Type / role
Status badge

Metadata rows
Actions menu
```

---

# 32. Search & Filter Behavior

All search/filter must be client-side.

## Locations

Search:

- name,
- code,
- city,
- manager.

Filters:

- type,
- status,
- city.

## Users

Search:

- first/last name,
- email,
- employee ID.

Filters:

- role,
- status,
- location.

## Search UX

- debounced only if needed,
- update instantly for small mock data,
- display result count,
- `Clear filters` appears only when relevant,
- empty filtered state offers reset.

---

# 33. Status Language

Use consistent badges.

## Location

Active:
`Active`

Setup:
`Setup`

Inactive:
`Inactive`

## User

Active:
`Active`

Invited:
`Invited`

Inactive:
`Inactive`

## Modules

Current:
`Active`

Future:
`Planned`

Flagship:
`Flagship`

Avoid:

- "Disabled" for roadmap modules in visible copy,
- "N/A" where a clearer phrase exists.

---

# 34. Charts

Only use charts that add meaning.

Required on Overview:

- role distribution.

Optional:

- locations by type.

Use shadcn charts where possible.

Rules:

- no 3D charts,
- no gradients unless subtle and brand-aligned,
- no huge legends,
- accessible labels,
- tooltips,
- mobile-safe,
- brand-derived palette.

---

# 35. Microinteractions

Use subtle motion.

Recommended:

- button hover: 120–160ms,
- card hover: 160–200ms,
- sidebar expansion: 180–220ms,
- dropdown/dialog uses shadcn motion,
- KPI number should not bounce,
- avoid springy playful motion.

Hover effects:

- slight border emphasis,
- very small translate only where useful,
- soft shadow increase.

No dramatic scale transforms.

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

---

# 36. Visual Density

This is an ERP.

It should not look like a marketing landing page.

## Good

- compact tables,
- restrained card heights,
- high information clarity,
- clear labels,
- dense but breathable layouts,
- 8px spacing rhythm,
- aligned baselines,
- deliberate whitespace.

## Bad

- giant 80px headers,
- huge metric cards,
- 32px gaps everywhere,
- rounded pill everything,
- excessive hero imagery,
- full-screen decorative backgrounds.

---

# 37. Empty States

Create intentional empty states.

## No locations

Title:

`No locations yet`

Body:

`Add a retail store or warehouse to start building the operating structure.`

CTA:

`Add location`

## No users

Title:

`No users found`

Body:

`Try changing the filters or add a new staff account.`

## No search results

Title:

`Nothing matches this search`

Body:

`Try a different name, code or filter.`

CTA:

`Clear filters`

## No notifications

Title:

`You're all caught up`

Body:

`New setup activity will appear here.`

---

# 38. Loading States

Even though data is local, use controlled skeletons for:

- initial persisted-state hydration,
- page transition boundaries if appropriate,
- details sheet image load.

Do not fake loading everywhere.

---

# 39. Error States

Since no network exists, errors primarily come from form validation or local persistence.

If local storage fails:

Show toast:

`Demo changes couldn't be saved in this browser.`

Keep in-memory state working where possible.

---

# 40. Accessibility Details

## Navigation

- current page uses `aria-current="page"`.
- disabled module buttons use `aria-disabled`.
- sidebar collapse has an accessible name.

## Tables

- real column headers,
- sortable headers indicate sort direction,
- row action menu label includes record name.

## Forms

- label/description/error associations,
- required field semantics,
- no placeholder-only labels.

## Dialogs

- title,
- description,
- focus trap,
- return focus on close.

## Color

Target WCAG AA contrast for application text.

---

# 41. Responsive Breakpoint Behavior

Use Tailwind's current breakpoint system, but design intentionally.

## ≥ 1440px

- expanded sidebar,
- 4 KPI cards in row,
- overview 12-column grid,
- 2-column settings layout,
- full tables.

## 1024–1439px

- sidebar may remain expanded if space works,
- otherwise collapse,
- KPIs 2×2 where necessary,
- secondary overview panels stack intelligently.

## 768–1023px

- sidebar icon rail or sheet,
- topbar simplified,
- tables may remain if columns fit,
- dialogs narrower,
- settings cards single-column where needed.

## < 768px

- sidebar sheet,
- single-column page,
- record card list,
- drawer for long forms,
- sticky form footer,
- compact toolbar,
- filters in sheet/popover,
- no content underlaps fixed UI.

## < 390px

Verify:

- 320–360px effective content still works,
- no clipped dropdowns,
- no three-button header rows,
- long email addresses wrap or truncate safely.

---

# 42. Recommended File Structure

```text
src/
├─ app/
│  ├─ layout.tsx
│  ├─ globals.css
│  ├─ page.tsx
│  └─ core-setup/
│     ├─ layout.tsx
│     ├─ page.tsx
│     ├─ loading.tsx
│     ├─ stores-warehouses/
│     │  └─ page.tsx
│     ├─ users-roles/
│     │  └─ page.tsx
│     ├─ permissions/
│     │  └─ page.tsx
│     └─ company-settings/
│        └─ page.tsx
│
├─ components/
│  ├─ shell/
│  │  ├─ app-sidebar.tsx
│  │  ├─ app-topbar.tsx
│  │  ├─ page-header.tsx
│  │  ├─ global-command.tsx
│  │  ├─ notification-popover.tsx
│  │  └─ quick-add-menu.tsx
│  │
│  ├─ core-setup/
│  │  ├─ overview/
│  │  ├─ locations/
│  │  │  ├─ locations-table.tsx
│  │  │  ├─ location-card.tsx
│  │  │  ├─ location-form.tsx
│  │  │  ├─ location-dialog.tsx
│  │  │  └─ location-detail-sheet.tsx
│  │  ├─ users/
│  │  │  ├─ users-table.tsx
│  │  │  ├─ user-form.tsx
│  │  │  ├─ user-dialog.tsx
│  │  │  └─ user-detail-sheet.tsx
│  │  ├─ roles/
│  │  │  ├─ role-card.tsx
│  │  │  ├─ role-dialog.tsx
│  │  │  └─ role-detail-sheet.tsx
│  │  ├─ permissions/
│  │  │  ├─ permission-matrix.tsx
│  │  │  ├─ role-policy-header.tsx
│  │  │  ├─ data-visibility-card.tsx
│  │  │  └─ preset-dialog.tsx
│  │  └─ settings/
│  │     ├─ settings-card.tsx
│  │     ├─ business-profile-dialog.tsx
│  │     ├─ branding-dialog.tsx
│  │     ├─ regional-dialog.tsx
│  │     ├─ defaults-dialog.tsx
│  │     └─ notifications-dialog.tsx
│  │
│  ├─ data-table/
│  ├─ status/
│  └─ ui/
│
├─ data/
│  └─ mock/
│     ├─ locations.ts
│     ├─ users.ts
│     ├─ roles.ts
│     ├─ permissions.ts
│     ├─ activity.ts
│     ├─ notifications.ts
│     └─ company-settings.ts
│
├─ lib/
│  ├─ cn.ts
│  ├─ format.ts
│  ├─ mock-delay.ts
│  └─ storage.ts
│
├─ store/
│  └─ demo-store.ts
│
└─ types/
   └─ core-setup.ts

public/
├─ brand/
│  └─ ...
└─ demo/
   ├─ locations/
   ├─ avatars/
   └─ empty/
```

---

# 43. Design Tokens

Centralize tokens in CSS variables.

Do not scatter raw hex values through components.

Use semantic roles:

```css
--background
--foreground
--card
--card-foreground
--popover
--popover-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--destructive
--border
--input
--ring

--brand-ink
--brand-surface-warm
--brand-champagne
--brand-amber
--brand-rose
--brand-moss
```

Map verified Flair values into the semantic system.

---

# 44. Card System

Use a small number of consistent card patterns.

## Metric card

- icon badge,
- label,
- value,
- supporting meta,
- optional trend / status.

## Summary card

- title,
- description,
- content,
- footer action.

## Settings card

- title,
- visible current values,
- `Edit` button,
- no inline giant form.

## Entity card

For mobile records:

- image/avatar,
- title,
- subtitle,
- status,
- metadata,
- action menu.

No custom card should look unrelated to another page.

---

# 45. Icons

Use Lucide.

Suggested mapping:

- Core Setup — `Settings2`
- Stores & Warehouses — `Warehouse`
- Users & Roles — `UsersRound`
- Permissions — `ShieldCheck`
- Company Settings — `Building2`
- Product & Inventory — `Boxes`
- Retail POS — `ScanLine`
- Purchasing — `ShoppingCart`
- Wholesale — `Handshake`
- E-Commerce — `Store`
- Reports — `ChartNoAxesCombined`
- Forecasting — `Sparkles`
- Accounting — `Landmark`

Use consistent stroke width.

Do not mix random icon libraries.

---

# 46. Toast Copy

Keep professional and concise.

Examples:

- `Location added`
- `Location updated`
- `User added`
- `User deactivated`
- `Role created`
- `Permission policy saved`
- `Preset applied`
- `Business profile updated`
- `Demo data restored`
- `Notification marked as read`

No emoji in operational toasts.

---

# 47. Confirmation Copy

## Delete location

Title:

`Delete this location?`

Body:

`This removes the location from the local demo workspace. This action cannot be undone unless demo data is reset.`

## Deactivate user

Title:

`Deactivate this user?`

Body:

`The user will remain visible in the demo but their status will change to inactive.`

## Reset demo

Title:

`Reset all demo data?`

Body:

`Every local change made in this browser will be replaced with the original seed data.`

Primary destructive button:

`Reset demo`

---

# 48. Command Palette Content

Groups:

## Navigate
- Core Setup Overview
- Stores & Warehouses
- Users & Roles
- Permissions
- Company Settings

## Locations
- all location names

## People
- all users

## Roles
- all roles

## Planned modules
- Modules 02–09, disabled

Clicking planned module results:

- no navigation,
- informative toast.

---

# 49. Demo Persistence Details

Use a migration-friendly structure.

```ts
{
  version: 1,
  data: {
    locations: [],
    users: [],
    roles: [],
    permissions: {},
    companySettings: {},
    activity: [],
    notifications: []
  }
}
```

When stored version is incompatible:

- safely reset to seed data,
- avoid crashing.

---

# 50. Visual QA Checklist

Inspect every required page at:

```text
1440 × 1000
1280 × 900
1024 × 768
768 × 1024
430 × 932
390 × 844
360 × 800
```

Check:

- sidebar,
- topbar,
- headers,
- cards,
- table headers,
- long names,
- badges,
- empty states,
- dialogs,
- sheets,
- drawers,
- form labels,
- dropdown placement,
- filter wrap,
- toast position,
- command menu,
- mobile keyboard-safe form behavior where possible.

---

# 51. Interaction QA Checklist

Test:

## Locations
- add
- edit
- duplicate
- status change
- delete
- search
- filters
- table/card toggle
- detail sheet
- persistence after reload

## Users
- add
- edit
- role change
- location assignment
- deactivate/reactivate
- search
- filters
- detail sheet
- persistence after reload

## Roles
- inspect role
- create custom role
- duplicate
- edit custom
- delete custom
- prevent deleting source roles

## Permissions
- select role
- toggle matrix permission
- toggle visibility setting
- switch location scope
- apply preset
- save
- reload and confirm persistence

## Company Settings
- edit each settings card
- validate form
- update preview
- reset demo
- reload and confirm seed state

## Shell
- collapse sidebar
- mobile sheet
- command palette
- quick add
- notifications
- profile menu
- disabled module behavior

---

# 52. Build QA Commands

Before final stop:

```bash
pnpm lint
pnpm build
```

If a separate typecheck script exists:

```bash
pnpm typecheck
```

Search code for:

```text
TODO
FIXME
console.log
any
href="#"
javascript:void(0)
```

Do not leave accidental development artifacts.

Intentional `TODO` notes may exist only in a dedicated future-scope document, not production components.

---

# 53. Final Polish Rules

Before declaring done:

- remove placeholder lorem ipsum,
- remove meaningless gradients,
- replace default shadcn example copy,
- make all empty states brand-consistent,
- use realistic dummy names,
- align numeric columns,
- normalize badge sizes,
- normalize dialog footers,
- check every icon size,
- ensure avatar fallbacks work,
- ensure image object-fit is correct,
- ensure focus state works on dark sidebar,
- ensure active nav state is unmistakable,
- ensure planned modules look intentional rather than broken.

---

# 54. Prohibited Shortcuts

Do not:

- make the whole app one page,
- use a single giant component,
- hardcode every record in JSX,
- use `alert()` / `confirm()`,
- use browser prompt dialogs,
- create fake API fetch calls,
- leave empty buttons,
- make Modules 02–09 links to `#`,
- build unfinished pages for Modules 02–09,
- use proposal pink as the ERP primary color without verifying it against Flair,
- use random stock photography inconsistent with the brand,
- use real employee identities without explicit source,
- claim generated location data is real,
- add a database,
- add Prisma,
- add Supabase,
- add Firebase,
- add authentication providers,
- require secrets,
- require environment variables for core demo use.

---

# 55. Optional Enhancements — Only After Required Scope Is Complete

Only add these if all required acceptance criteria already pass.

## Keyboard shortcuts help

Open with:

`?`

Show:

- Command search
- Quick add
- Sidebar toggle

## Theme mode

If implemented:

- light is default,
- dark mode must be intentionally designed,
- preserve brand character,
- do not simply invert colors.

## Export demo JSON

Allow:

`Export demo state`

Download a local JSON snapshot.

No import is required.

## Activity detail popup

Click activity item to show:

- actor,
- action,
- target,
- timestamp,
- source.

---

# 56. Final Handoff Output

At completion, provide:

1. working project,
2. clean `README.md`,
3. this specification retained in the repository,
4. concise implementation summary,
5. list of routes,
6. list of installed dependencies,
7. note that data is frontend-only,
8. note that Modules 02–09 are intentionally disabled,
9. final QA status,
10. any clearly documented deviations.

Recommended README statement:

> This delivery implements the frontend experience for Flair ERP Module 01 — Core Setup. All data mutations are stored locally in the browser for demonstration purposes. Modules 02–09 are represented in the application navigation but intentionally remain unavailable until their future implementation phases.

---

# 57. Final Acceptance Statement

The build is complete only when it can be demonstrated from a fresh browser session as follows:

1. Open `/core-setup`.
2. Immediately understand that Core Setup is the active foundational module.
3. See all nine ERP modules in the sidebar.
4. Confirm Modules 02–09 cannot navigate.
5. Add a location in a polished popup.
6. See it instantly appear in the list and overview.
7. Add a user and assign a source-defined role.
8. Open a user detail sheet.
9. Change a role's permissions.
10. Apply and save a permission preset.
11. Edit the Flair company profile through a focused popup.
12. Refresh the browser and see changes persist.
13. Reset demo data and restore the original seed state.
14. Repeat the experience on mobile without layout breakage.
15. Run the production build with no errors.

If any one of these fails, continue the loop.

---

# 58. One-Line Build Direction

> **Build a refined Flair-branded operations workspace, not a generic admin dashboard: source-faithful Core Setup functionality, strong enterprise UX, polished popup-driven interactions, responsive behavior, rich local demo data, and a navigation architecture ready for the remaining eight ERP modules.**
