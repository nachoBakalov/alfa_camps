# Frontend Master Plan
## Camp Battle System

Version: 1.0

Purpose:
This document defines the frontend product direction, architecture goals, UI goals, and implementation priorities for the Camp Battle System frontend.

The frontend must support two major experiences:

1. Admin app
2. Public app

The frontend stack is:

- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod

---

# 1. Product Goals

The frontend must provide:

- a mobile-first admin panel for coaches and super admins
- a polished public experience for camps, rankings, teams, and player profiles
- a clear and fast workflow for camp operations
- a stable API integration layer
- reusable UI patterns
- a structure that is easy to extend with Codex

---

# 2. Frontend Areas

## Admin App

The admin app is used by:
- coaches
- super admins

Core goals:
- login
- create and manage camps
- manage players
- manage camp participations
- manage team assignments
- manage battles
- manage scoring
- manage progression definitions
- manage photo metadata

The admin app must be:
- mobile-first
- fast to use
- low-friction
- readable
- card-oriented

---

## Public App

The public app is used by:
- parents
- kids
- staff
- visitors

Core goals:
- view camp overview
- view camp rankings
- view teams
- view participants
- view player profiles
- view gallery data

The public app must be:
- visually strong
- readable
- polished
- easy to browse on mobile

---

# 3. Architecture Direction

The frontend will be implemented as a single React app with shared routing and shared API infrastructure.

Recommended route groups:

- /login
- /admin/*
- /camps/:campId
- /camps/:campId/rankings
- /players/:playerId

Reasons:
- simpler deployment
- one shared design system
- one shared API layer
- one auth implementation
- less duplication

---

# 4. State Strategy

## Server state
Use TanStack Query for:
- data fetching
- caching
- refetching
- mutation handling
- invalidation
- loading/error states

## Client state
Use lightweight local state/context/store for:
- auth token
- current user role
- UI state such as dialogs, drawers, local filters if needed

Do not introduce Redux unless a real need appears.

---

# 5. Form Strategy

Use:
- React Hook Form
- Zod

All admin forms should use:
- typed schema validation
- clear error messages
- inline field errors
- loading/disabled submit states

---

# 6. Styling Strategy

Use:
- Tailwind CSS

Styling goals:
- clean spacing
- consistent cards
- large tap targets
- mobile-first layouts
- accessible contrast
- clear hierarchy

Admin UI style:
- practical
- clean
- strong layout structure
- cards over dense tables

Public UI style:
- visual
- more premium
- hero sections
- progression badges
- ranking cards
- team blocks

---

# 7. Design Principles

## Admin
- mobile-first
- cards first
- minimal clutter
- sticky actions when useful
- clear sectioning
- quick feedback after actions
- safe destructive actions

## Public
- more visual than admin
- readable ranking sections
- strong hero blocks
- progression and medals presented clearly
- clean participant and team cards

---

# 8. Security and Access Model

## Public routes
Public routes should not require authentication.

## Admin routes
Admin routes should require authentication.

Role-aware UI must hide or disable controls where appropriate, especially:
- super-admin-only actions
- destructive admin actions
- user management actions

Frontend role checks are UI-only.
Backend remains source of truth.

---

# 9. API Integration Goals

The frontend must:
- consume the existing backend endpoints cleanly
- centralize API requests in `src/api`
- centralize query keys
- standardize error parsing
- standardize loading patterns
- avoid direct fetch logic inside pages

---

# 10. Readiness Goals Before Heavy UI Work

Before building many screens, the frontend should first have:

- app shell
- routing
- auth storage
- protected routes
- API client
- query provider
- shared UI primitives
- standard error handling
- page layout system

---

# 11. Delivery Strategy

Recommended frontend build phases:

## Phase 1
Foundation
- Vite setup
- Tailwind setup
- Router
- Query provider
- API client
- auth flow
- admin/public layouts

## Phase 2
Admin core
- dashboard
- camp types
- team templates
- camps
- players

## Phase 3
Camp operations
- participations
- team assignments
- battles
- battle results
- duels
- scoring actions

## Phase 4
Progression admin
- rank definitions
- achievements
- medals

## Phase 5
Public pages
- camp public page
- rankings
- player profile
- photo gallery

---

# 12. Working Rule for AI-assisted Development

Frontend work must be split into:
- small tasks
- clear scope
- one result per task
- no massive one-shot prompts

Codex should always follow:
- frontend architecture docs
- screen plan docs
- frontend coding rules

---

# 13. Success Criteria

The frontend is considered successful when:

- coaches can manage camps and results from mobile devices
- public visitors can browse camps, rankings, teams, and player profiles
- the UI is clear and consistent
- the codebase remains modular and easy to extend
- backend endpoints map cleanly to frontend screens