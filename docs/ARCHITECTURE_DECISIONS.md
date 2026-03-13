# Architecture Decisions
Camp Battle System

This document defines the core architectural decisions for the project.

Purpose:
- Ensure consistency across the codebase
- Prevent AI coding tools from inventing new patterns
- Provide a clear source of truth for architectural rules

If implementation conflicts arise, follow this order of priority:

1. product-spec-v1.md
2. database-schema.md
3. ARCHITECTURE_DECISIONS.md
4. coding-guidelines.md

---

# 1. Backend Framework

Backend framework:

NestJS

Reasons:
- Modular architecture
- Built-in dependency injection
- Strong TypeScript support
- Scales well for large backend systems

Controllers must remain thin.
Business logic must live in services.

---

# 2. Programming Language

Language: TypeScript

Rules:
- Strict typing preferred
- Avoid use of `any`
- Use interfaces where helpful
- Prefer explicit types over inference in services

---

# 3. Database

Database: PostgreSQL

Reasons:
- relational integrity
- strong indexing
- reliable transactions
- good compatibility with TypeORM

Primary key type:
UUID

All timestamps use:

timestamptz

---

# 4. ORM

ORM: TypeORM

Rules:
- Use explicit entities
- Use migrations instead of synchronize
- Entities should mirror database schema
- Avoid complex lazy loading patterns

All schema changes must go through migrations.

---

# 5. Authentication

Authentication strategy:

JWT (JSON Web Token)

Libraries:
- @nestjs/jwt
- passport
- passport-jwt

Rules:

- Login endpoint returns a JWT token
- Token contains:
sub (user id)
email
role


Inactive users cannot log in.

---

# 6. Authorization

Authorization uses:

Role Based Access Control (RBAC)

Roles:

- SUPER_ADMIN
- COACH

Implementation:

- Roles decorator
- RolesGuard
- JwtAuthGuard

Rules:

- Guards must live in `src/common/guards`
- Decorators must live in `src/common/decorators`

---

# 7. Folder Structure

All backend code must follow the structure defined in:

docs/backend-architecture.md

Key rules:

- Every domain module lives under `src/modules`
- Shared utilities go in `src/common`
- Database migrations go in `src/database/migrations`

Controllers must never contain business logic.

---

# 8. Domain Modules

Each domain module must follow this structure:
module-name/
dto/
entities/
module-name.controller.ts
module-name.service.ts
module-name.module.ts


Optional folders:
interfaces/
enums/


Do not introduce additional layers unless necessary.

---

# 9. Source of Truth for Game Logic

The system is event-based.

Source of truth:

- battles
- battle results
- duels
- team assignments

Statistics stored in `camp_participations` are cached values.

They must always be derivable from source events.

---

# 10. Cached Statistics

These fields are cached for performance:

camp_participations:

- kills
- knife_kills
- survivals
- duel_wins
- mass_battle_wins
- points

player_ranks is persisted camp-scoped progression state.

It stores the current rank per category for each participation and is updated by rank progression logic.

camp_teams:

- team_points

Rules:

- Cached stats must be updated by scoring services
- They must remain recomputable

---

# 11. Scoring Logic Location

Scoring logic must live in dedicated services.

Examples:
battle-scoring.service.ts
rank-progression.service.ts
achievement.service.ts


Controllers must never contain scoring logic.

---

# 12. Rank System

The system uses multiple rank categories.

Each participation can hold one current rank per category.

V1 categories:

- KILLS_RANK (thresholds: 1, 5, 10, 15, 20, 25, 30, 35, 40)
- MASS_BATTLE_WINS_RANK (thresholds: 1, 2, 3, 4, 5, 6, 7, 8, 9)
- CHALLENGE_WINS_RANK (thresholds: 1, 2, 3, 4, 5, 6, 7, 8, 9)
- SURVIVALS_RANK (thresholds: 1, 2, 3, 4, 5, 6, 7, 8, 9)

Ranks are defined in `rank_definitions` and grouped by `rank_categories`.

Current category rank per participation is stored in `player_ranks`.

`player_ranks` is persisted progression state, not a simple numeric cache field.

---

# 13. Achievements

Achievements remain supported in backend, but are not treated as a core active progression direction in the current product track.

Examples:

- kills
- survivals
- duel wins
- points

Achievements are stored in:
player_achievements


Achievements must never be duplicated.

---

# 14. Medals

Medals represent special recognition.

Two types:

- MANUAL
- AUTO

Version 1 uses primarily manual medals.

AUTO medals are future-facing unless explicit auto-award rules exist.

Medals are stored in:
player_medals

Medal icon assets are stored in the frontend public folder.
Backend stores only icon path/URL.

---

# 14.1 Asset Storage

Frontend public folder stores image assets for:

- rank icons
- medal icons
- player avatars
- team logos

Backend stores only asset paths/URLs and never stores binary image files in database tables.


---

# 15. Team History

Players may change teams during a camp.

Team assignments are stored in:
team_assignments


The latest assignment represents the current team.

Historical battle results must not change if a player changes teams later.

---

# 16. Camp Finalization

A camp can be finalized once.

Finalization:

1. Locks battle edits
2. Applies final ranking bonuses
3. Marks camp as FINISHED

Final bonuses:

1st place → +7 points  
2nd place → +5 points  
3rd place → +3 points  
4th+ → +1 point  

Finalization must be idempotent.

---

# 17. Mobile First Admin

Admin interface is mobile-first.

Rules:

- avoid complex tables
- prefer card layouts
- large buttons
- minimal forms

This impacts API design.

Endpoints should be simple and predictable.

---

# 18. AI Coding Rules

AI tools must follow:

docs/codex-task-rules.md

Key rule:

AI must not invent architecture.

It must follow the architecture documents.

---

# 19. Future Extensions

The architecture must remain compatible with:

- audit logs
- battle event feeds
- advanced achievements
- stat recomputation jobs
- player season history
- public leaderboard APIs

---

# 20. Guiding Principle

Keep the system:

- simple
- explicit
- event-driven
- testable
- scalable