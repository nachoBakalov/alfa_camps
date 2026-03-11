# Frontend Architecture
## Camp Battle System

Version: 1.0

Purpose:
This document defines the frontend technical architecture, folder structure, routing model, API layer rules, state strategy, and component strategy.

---

# 1. Stack

Core stack:
- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod

Optional utilities:
- clsx
- tailwind-merge

---

# 2. App Structure

The frontend is a single React app with two route groups:

1. Admin area
2. Public area

This avoids:
- duplicated infrastructure
- duplicated API logic
- duplicated design system

---

# 3. Recommended Folder Structure

```text
src/
  main.tsx
  App.tsx

  app/
    router.tsx
    providers.tsx

  api/
    client.ts
    auth.api.ts
    camp-types.api.ts
    team-templates.api.ts
    camps.api.ts
    camp-teams.api.ts
    players.api.ts
    participations.api.ts
    team-assignments.api.ts
    battles.api.ts
    battle-player-results.api.ts
    duels.api.ts
    scoring.api.ts
    ranks.api.ts
    achievements.api.ts
    medals.api.ts
    rankings.api.ts
    player-profiles.api.ts
    camp-public.api.ts
    photos.api.ts

  types/
    auth.ts
    api.ts
    camp.ts
    player.ts
    battle.ts
    ranking.ts
    progression.ts
    photo.ts

  lib/
    utils.ts
    cn.ts
    date.ts
    auth.ts
    query.ts
    errors.ts

  hooks/
    useAuth.ts
    useCurrentUser.ts
    useDebounce.ts
    usePagination.ts

  store/
    auth.store.ts

  components/
    ui/
    layout/
    forms/
    feedback/
    cards/
    rankings/
    progression/
    gallery/

  features/
    auth/
    admin-dashboard/
    camp-types/
    team-templates/
    camps/
    camp-teams/
    players/
    participations/
    team-assignments/
    battles/
    battle-player-results/
    duels/
    scoring/
    ranks/
    achievements/
    medals/
    photos/
    rankings/
    player-profiles/
    camp-public/

  pages/
    auth/
    admin/
    public/

  styles/
    globals.css