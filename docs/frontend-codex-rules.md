# Frontend Codex Rules
## Camp Battle System

Purpose:
These rules define how Codex should work on the frontend codebase.

Codex must follow these rules strictly.

---

# 1. Scope Rules

1. Work only on the requested task.
2. Do not implement unrelated screens or features.
3. Do not invent architecture.
4. Follow the frontend docs:
   - docs/frontend-master-plan.md
   - docs/frontend-architecture.md
   - docs/frontend-screen-plan.md

---

# 2. Stack Rules

Use:
- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod

Do not replace the stack unless explicitly instructed.

---

# 3. Folder Rules

1. Follow the frontend folder structure exactly.
2. Put API logic in `src/api`.
3. Put shared UI in `src/components/ui`.
4. Put domain-specific logic in `src/features/<feature>`.
5. Keep pages thin.
6. Do not create random folders or alternate architectures.

---

# 4. Coding Style Rules

1. Write explicit, readable code.
2. Prefer small components.
3. Avoid unnecessary abstractions.
4. Avoid giant components.
5. Use TypeScript types carefully.
6. Avoid `any`.
7. Prefer straightforward logic over clever patterns.

---

# 5. API Rules

1. Do not call fetch directly from page components.
2. Put API requests in dedicated files under `src/api`.
3. Reuse the shared API client.
4. Use the backend response contracts as source of truth.
5. Parse backend error responses consistently.

---

# 6. Query Rules

1. Use TanStack Query for server state.
2. Use stable query keys.
3. Invalidate only relevant queries after mutations.
4. Do not add ad-hoc fetch state logic if a query fits better.

---

# 7. Form Rules

1. Use React Hook Form for forms.
2. Use Zod for validation.
3. Show field errors clearly.
4. Handle submit loading state.
5. Keep form components readable.

---

# 8. UI Rules

1. Use Tailwind CSS utility classes.
2. Design mobile-first by default.
3. Prefer cards over dense tables for admin screens.
4. Keep spacing consistent.
5. Use reusable UI primitives when possible.
6. Do not hardcode messy inline styles.

---

# 9. Auth Rules

1. Keep auth logic centralized.
2. Use the shared auth store/hooks.
3. Protect admin routes.
4. Do not expose sensitive data.
5. Respect user role checks in UI where appropriate.

---

# 10. Error Handling Rules

1. Use the backend's standardized error response shape.
2. Show useful error messages to users.
3. Surface validation errors clearly in forms.
4. Do not swallow API errors silently.

---

# 11. Component Rules

1. Shared reusable components go in `src/components`.
2. Feature-specific components go in `src/features`.
3. Keep component responsibilities small.
4. Separate display components from hook/API wiring where useful.

---

# 12. Route Rules

1. Public routes must remain public unless explicitly changed.
2. Admin routes must remain protected.
3. Keep route structure aligned with frontend-screen-plan.md.

---

# 13. Styling Rules

1. Use Tailwind CSS only.
2. Build consistent cards, badges, buttons, and inputs.
3. Maintain strong visual hierarchy.
4. Keep admin UI practical and public UI more polished.

---

# 14. Task Output Rules

For each task, Codex should:
1. list created files
2. list modified files
3. summarize what was implemented
4. mention assumptions clearly

---

# 15. Safety Rule

If a requested frontend change would require backend contract changes, Codex should not invent them silently.

It should:
- work with the existing backend contracts
- or clearly state the assumption/required backend change