# Database Schema
## Camp Battle System (V1)

Version: 1.0

This document defines the production-level database schema for the Camp Battle System backend.

Tech stack:
- PostgreSQL
- NestJS
- TypeORM

Goals:
- Support multiple camp types
- Support reusable team templates
- Support camp-specific teams
- Support global player profiles
- Support player participation in multiple camps
- Support team changes during a camp
- Support battles and duel sessions
- Support automatic scoring
- Support ranks, achievements, and medals
- Support public rankings and player profiles

---

# 1. Design Principles

1. All primary keys use UUID.
2. All timestamps use `timestamptz`.
3. Global player identity is separated from camp participation.
4. All important statistics are camp-scoped.
5. Global statistics are computed through aggregation.
6. Team changes are stored as history, not overwritten.
7. Battles are the source of truth for scoring.
8. Cached stats are allowed for performance, but must be recomputable.
9. Camp finalization must lock final ranking logic.
10. The schema is designed for mobile-first admin workflows and public statistics pages.

---

# 2. Enums

## user_role
- SUPER_ADMIN
- COACH

## camp_status
- DRAFT
- ACTIVE
- FINISHED

## battle_type
- MASS_BATTLE
- DUEL_SESSION

## battle_status
- DRAFT
- COMPLETED
- CANCELLED

## battle_session
- MORNING
- AFTERNOON
- EVENING

## achievement_condition_type
- KILLS
- SURVIVALS
- DUEL_WINS
- POINTS

## medal_type
- MANUAL
- AUTO

---

# 3. Tables

## 3.1 users

Stores system users.

Fields:
- id: uuid, primary key
- email: varchar, unique, not null
- password_hash: varchar, not null
- first_name: varchar, not null
- last_name: varchar, not null
- role: user_role, not null
- is_active: boolean, not null, default true
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

Notes:
- Used for authentication and authorization.
- Only super admins can manage other users.
- Coaches have full operational access except user management.

Indexes:
- unique(email)

---

## 3.2 camp_types

Reusable camp templates.

Fields:
- id: uuid, primary key
- name: varchar, unique, not null
- slug: varchar, unique, not null
- description: text, nullable
- logo_url: varchar, nullable
- cover_image_url: varchar, nullable
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

Notes:
- Example camp types:
  - Игри на клановете
  - Войната на митичните
  - Четник

Indexes:
- unique(name)
- unique(slug)

---

## 3.3 team_templates

Reusable team definitions for a camp type.

Fields:
- id: uuid, primary key
- camp_type_id: uuid, not null, fk -> camp_types.id
- name: varchar, not null
- color: varchar, nullable
- logo_url: varchar, nullable
- sort_order: integer, nullable
- created_at: timestamptz, not null

Notes:
- These are templates only.
- When creating a camp, these can be copied into camp_teams.

Indexes:
- index(camp_type_id)
- unique(camp_type_id, name)

---

## 3.4 camps

Concrete camp instances.

Fields:
- id: uuid, primary key
- camp_type_id: uuid, not null, fk -> camp_types.id
- title: varchar, not null
- year: integer, not null
- start_date: date, not null
- end_date: date, not null
- location: varchar, nullable
- description: text, nullable
- logo_url: varchar, nullable
- cover_image_url: varchar, nullable
- status: camp_status, not null, default DRAFT
- created_by: uuid, nullable, fk -> users.id
- finalized_at: timestamptz, nullable
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

Notes:
- A camp is a real event for a given year and date range.
- Camps begin as DRAFT, then become ACTIVE, then FINISHED.

Indexes:
- index(camp_type_id)
- index(status)
- index(year)
- index(created_by)

Recommended unique constraint:
- unique(camp_type_id, year, title)

---

## 3.5 camp_teams

Teams that exist inside a specific camp.

Fields:
- id: uuid, primary key
- camp_id: uuid, not null, fk -> camps.id
- name: varchar, not null
- color: varchar, nullable
- logo_url: varchar, nullable
- team_points: integer, not null, default 0
- final_position: integer, nullable
- is_active: boolean, not null, default true
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

Notes:
- Teams are camp-specific, even if based on reusable templates.
- Team points are cached and updated by scoring logic.
- final_position is used during camp finalization.

Indexes:
- index(camp_id)
- unique(camp_id, name)

---

## 3.6 players

Global player profiles.

Fields:
- id: uuid, primary key
- first_name: varchar, not null
- last_name: varchar, nullable
- nickname: varchar, nullable
- avatar_url: varchar, nullable
- is_active: boolean, not null, default true
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

Notes:
- A player can participate in many camps.
- Public profile data comes from this table plus aggregated participation data.

Indexes:
- index(first_name)
- index(last_name)
- index(nickname)

---

## 3.7 camp_participations

Links a player to a camp and stores cached camp-specific stats.

Fields:
- id: uuid, primary key
- camp_id: uuid, not null, fk -> camps.id
- player_id: uuid, not null, fk -> players.id
- current_rank_id: uuid, nullable, fk -> rank_definitions.id
- kills: integer, not null, default 0
- survivals: integer, not null, default 0
- duel_wins: integer, not null, default 0
- points: integer, not null, default 0
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

Notes:
- This is the main camp-scoped player record.
- Stats here are cached and updated after battle completion.
- Stats must remain derivable from underlying battle data plus medals/finalization logic if needed.

Indexes:
- index(camp_id)
- index(player_id)
- unique(camp_id, player_id)
- index(current_rank_id)

---

## 3.8 team_assignments

Stores team assignment history for a camp participation.

Fields:
- id: uuid, primary key
- participation_id: uuid, not null, fk -> camp_participations.id
- team_id: uuid, not null, fk -> camp_teams.id
- assigned_at: timestamptz, not null
- assigned_by: uuid, nullable, fk -> users.id
- note: text, nullable

Notes:
- Players may change teams during a camp.
- The latest assignment is considered the current team.
- Old battle results must not be overwritten when assignments change later.

Indexes:
- index(participation_id)
- index(team_id)
- index(assigned_at)

---

## 3.9 battles

Stores battle sessions.

Fields:
- id: uuid, primary key
- camp_id: uuid, not null, fk -> camps.id
- title: varchar, not null
- battle_type: battle_type, not null
- battle_date: date, not null
- session: battle_session, nullable
- winning_team_id: uuid, nullable, fk -> camp_teams.id
- status: battle_status, not null, default DRAFT
- notes: text, nullable
- completed_at: timestamptz, nullable
- created_by: uuid, nullable, fk -> users.id
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

Notes:
- MASS_BATTLE uses battle_player_results.
- DUEL_SESSION uses duels.
- A battle is only scored when marked COMPLETED.

Indexes:
- index(camp_id)
- index(battle_type)
- index(status)
- index(battle_date)
- index(winning_team_id)

---

## 3.10 battle_player_results

Stores per-player results for mass battles.

Fields:
- id: uuid, primary key
- battle_id: uuid, not null, fk -> battles.id
- participation_id: uuid, not null, fk -> camp_participations.id
- team_id: uuid, nullable, fk -> camp_teams.id
- kills: integer, not null, default 0
- survived: boolean, not null, default false
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

Notes:
- Used only for MASS_BATTLE.
- Stores the player’s team at the time of the battle.
- team_id is intentionally stored to preserve historical team membership for that battle.

Indexes:
- index(battle_id)
- index(participation_id)
- index(team_id)
- unique(battle_id, participation_id)

---

## 3.11 duels

Stores duels inside duel sessions.

Fields:
- id: uuid, primary key
- battle_id: uuid, not null, fk -> battles.id
- player_a_participation_id: uuid, not null, fk -> camp_participations.id
- player_b_participation_id: uuid, not null, fk -> camp_participations.id
- winner_participation_id: uuid, nullable, fk -> camp_participations.id
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

Notes:
- Used only when parent battle is DUEL_SESSION.
- One battle can contain many duels.
- A player may appear in multiple duels in the same day.

Indexes:
- index(battle_id)
- index(player_a_participation_id)
- index(player_b_participation_id)
- index(winner_participation_id)

Constraints:
- player_a_participation_id != player_b_participation_id

---

## 3.12 rank_definitions

Defines camp progression ranks.

Fields:
- id: uuid, primary key
- name: varchar, not null
- icon_url: varchar, nullable
- kill_threshold: integer, not null
- rank_order: integer, not null
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

Notes:
- Rank is determined by kills within a camp.
- A participation has one current rank at a time.
- Rank logic should choose the highest rank whose threshold is met.

Indexes:
- unique(rank_order)
- unique(kill_threshold)

---

## 3.13 achievement_definitions

Defines automatic achievements.

Fields:
- id: uuid, primary key
- name: varchar, not null
- description: text, nullable
- icon_url: varchar, nullable
- condition_type: achievement_condition_type, not null
- threshold: integer, not null
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

Notes:
- V1 supports simple threshold-based achievements.
- Examples:
  - kills >= 5
  - survivals >= 3
  - duel_wins >= 5
  - points >= 20

Indexes:
- index(condition_type)
- unique(condition_type, threshold, name)

---

## 3.14 player_achievements

Stores unlocked achievements for a camp participation.

Fields:
- id: uuid, primary key
- participation_id: uuid, not null, fk -> camp_participations.id
- achievement_id: uuid, not null, fk -> achievement_definitions.id
- unlocked_at: timestamptz, not null

Notes:
- Must not allow duplicate unlocks for the same participation + achievement.

Indexes:
- index(participation_id)
- index(achievement_id)
- unique(participation_id, achievement_id)

---

## 3.15 medal_definitions

Defines medals.

Fields:
- id: uuid, primary key
- name: varchar, not null
- description: text, nullable
- icon_url: varchar, nullable
- type: medal_type, not null, default MANUAL
- created_at: timestamptz, not null
- updated_at: timestamptz, not null

Notes:
- V1 primarily uses manual medals.
- Automatic medals may be added later.

Indexes:
- unique(name)
- index(type)

---

## 3.16 player_medals

Stores medals awarded to a player in a specific camp participation.

Fields:
- id: uuid, primary key
- participation_id: uuid, not null, fk -> camp_participations.id
- medal_id: uuid, not null, fk -> medal_definitions.id
- awarded_by: uuid, nullable, fk -> users.id
- note: text, nullable
- awarded_at: timestamptz, not null

Notes:
- Medals are camp-scoped.
- Same medal may be awarded more than once only if the product explicitly allows it.
- V1 recommendation: do not allow duplicate medal awards per participation unless a strong use case appears.

Indexes:
- index(participation_id)
- index(medal_id)
- index(awarded_by)

Recommended unique constraint for V1:
- unique(participation_id, medal_id)

---

## 3.17 photos

Stores uploaded images.

Fields:
- id: uuid, primary key
- camp_id: uuid, nullable, fk -> camps.id
- team_id: uuid, nullable, fk -> camp_teams.id
- player_id: uuid, nullable, fk -> players.id
- image_url: varchar, not null
- uploaded_by: uuid, nullable, fk -> users.id
- created_at: timestamptz, not null

Notes:
- V1 can keep this simple.
- A photo may belong to:
  - a camp
  - a team
  - a player
- Exact validation rules can be enforced in service logic.

Indexes:
- index(camp_id)
- index(team_id)
- index(player_id)
- index(uploaded_by)

---

# 4. Relationship Summary

## Core relationships

- camp_types -> team_templates = one-to-many
- camp_types -> camps = one-to-many
- camps -> camp_teams = one-to-many
- camps -> camp_participations = one-to-many
- players -> camp_participations = one-to-many
- camp_participations -> team_assignments = one-to-many
- camps -> battles = one-to-many
- battles -> battle_player_results = one-to-many
- battles -> duels = one-to-many
- camp_participations -> player_achievements = one-to-many
- camp_participations -> player_medals = one-to-many

## Important historical modeling rule

Current team must be derived from the latest team assignment, but:
- battle_player_results.team_id preserves historical team at battle time
- old battles must not be retroactively changed when a player changes teams later

---

# 5. Cached vs Source-of-Truth Data

## Source-of-truth data
- battles
- battle_player_results
- duels
- team_assignments
- player_medals
- final team positions

## Cached / derived data
- camp_participations.kills
- camp_participations.survivals
- camp_participations.duel_wins
- camp_participations.points
- camp_participations.current_rank_id
- camp_teams.team_points

Notes:
- Cached fields are allowed for performance and easier ranking queries.
- Services must keep them in sync.
- If needed, an admin-only recompute job can rebuild them from source data.

---

# 6. Scoring Rules (V1)

## Mass battle
For each completed mass battle:
- each kill = +1 individual point
- each survival = +2 individual points
- winning team receives +3 team points
- each player from the winning team in that battle receives +3 individual points

## Duel session
For each duel:
- duel winner gets +1 duel win
- duel winner gets +1 individual point

## Camp finalization
After final team positions are set:
- team position 1 => each player in that team gets +7 points
- team position 2 => each player in that team gets +5 points
- team position 3 => each player in that team gets +3 points
- team position 4 or lower => each player in that team gets +1 point

Important:
- Finalization should only be applied once.
- The system must prevent duplicate final bonus application.

---

# 7. Recommended Constraints and Validation Rules

1. A player cannot have more than one participation in the same camp.
2. A camp team belongs to exactly one camp.
3. A team assignment must belong to the same camp participation’s camp.
4. A battle must belong to the same camp as all its results.
5. A duel winner must be either player A or player B.
6. A mass battle result must belong to a MASS_BATTLE.
7. A duel must belong to a DUEL_SESSION.
8. A finished camp should not accept normal battle edits.
9. A completed battle should not be silently modified without explicit admin logic.
10. Final bonus scoring must be idempotent.

---

# 8. Recommended Future Extensions

These are not required for V1 but the schema should stay compatible with them:

- audit logs
- automatic medals
- battle event feed
- richer public player history
- image galleries by battle
- soft deletes
- stat recomputation jobs
- team template versioning
- achievement categories
- multi-language labels

---

# 9. Implementation Notes for NestJS + TypeORM

1. Use UUID generated in the database or application consistently.
2. Prefer explicit foreign keys and indexes.
3. Keep entity classes close to this schema.
4. Business rules must live in services, not controllers.
5. Use migrations instead of relying on synchronize in production.
6. Avoid premature polymorphic abstractions.
7. Keep V1 simple and stable.

---

# 10. V1 Build Order Recommendation

Recommended implementation order:

1. users
2. auth
3. camp_types
4. team_templates
5. camps
6. camp_teams
7. players
8. camp_participations
9. team_assignments
10. battles
11. battle_player_results
12. duels
13. scoring
14. rank_definitions
15. achievement_definitions
16. player_achievements
17. medal_definitions
18. player_medals
19. camp finalization
20. rankings
21. public profile stats

---

# 11. Final Notes

This schema is designed for:
- production-oriented backend architecture
- clear AI-assisted implementation
- incremental development
- minimal ambiguity in business logic

If implementation conflicts appear, follow this order of truth:
1. product spec
2. database schema
3. coding guidelines
4. simplest stable implementation choice

