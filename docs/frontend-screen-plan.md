
```md
# Frontend Screen Plan
## Camp Battle System

Version: 1.0

Purpose:
This document defines the screen-by-screen plan for the frontend.

It includes:
- admin screens
- public screens
- expected functionality
- screen grouping
- implementation order

---

# 1. Admin Screens

## 1.1 Login
Route:
- /login

Purpose:
- authenticate coaches and super admins

Content:
- email field
- password field
- submit button
- error message area

Behavior:
- on success -> redirect to /admin
- on failure -> show backend error message

---

## 1.2 Admin Dashboard
Route:
- /admin

Purpose:
- provide quick overview and actions

Content:
- active camps
- latest battles
- quick actions
- summary counters

Quick actions:
- create camp
- add player
- create battle
- finalize camp

---

## 1.3 Camp Types
Routes:
- /admin/camp-types

Screens:
- list
- create/edit modal or page

List content:
- name
- slug
- description
- logo preview
- cover preview

Actions:
- create
- edit
- delete

---

## 1.4 Team Templates
Routes:
- /admin/team-templates

Screens:
- list
- create/edit

Content:
- camp type filter
- template name
- color
- logo preview
- sort order

Actions:
- create
- edit
- delete

---

## 1.5 Camps
Routes:
- /admin/camps
- /admin/camps/:campId

Screens:
- camps list
- create camp
- edit camp
- camp detail shell

Camps list:
- title
- year
- camp type
- status
- location
- date range

Camp detail shell tabs:
- Overview
- Teams
- Players
- Participations
- Assignments
- Battles
- Rankings
- Photos
- Settings

---

## 1.6 Camp Teams
Routes:
- /admin/camps/:campId/teams

Screens:
- team list
- add/edit team
- clone from templates action

Content:
- name
- color
- logo
- team points
- final position
- active status

Actions:
- create
- edit
- delete
- clone from templates

---

## 1.7 Players
Routes:
- /admin/players
- /admin/players/:playerId

Screens:
- global players list
- create/edit player
- player detail

List content:
- avatar
- first name
- last name
- nickname
- active status

Player detail:
- basic info
- participations summary
- link to public profile

---

## 1.8 Camp Participations
Routes:
- /admin/camps/:campId/participations

Screens:
- participation list
- add existing player
- create player and participation

Content:
- player info
- current stats
- current team
- actions

Actions:
- add participation
- view assignment history
- open player profile

---

## 1.9 Team Assignments
Routes:
- /admin/camps/:campId/team-assignments

Screens:
- assignment history by participation
- create new assignment

Content:
- current team
- assignment history
- assignedAt
- assignedBy
- note

Actions:
- assign team
- edit note/date if needed

---

## 1.10 Battles
Routes:
- /admin/camps/:campId/battles
- /admin/battles/:battleId

Screens:
- battle list
- create battle
- battle detail

Battle list:
- title
- type
- date
- session
- status
- winning team

Battle detail:
- overview
- results or duels
- score preview
- apply scoring

---

## 1.11 Mass Battle Results
Route:
- /admin/battles/:battleId

Applicable when:
- battle type = MASS_BATTLE

Content:
- winning team selector
- player result cards
- kills input
- knife kills input
- survived toggle

Actions:
- save/update result rows
- preview score
- apply score

---

## 1.12 Duel Session
Route:
- /admin/battles/:battleId

Applicable when:
- battle type = DUEL_SESSION

Content:
- duel list
- add duel
- set winner

Actions:
- create duel
- update winner
- remove duel
- preview score
- apply score

---

## 1.13 Scoring
Relevant routes:
- battle detail
- camp detail rankings/settings area

Content:
- battle score preview
- apply score action
- finalize camp score action

Behavior:
- preview before apply
- clear success/error feedback
- safe confirmation for finalization

---

## 1.14 Rank Definitions
Routes:
- /admin/ranks

Content:
- categories
- grouped rank definitions
- thresholds
- icon preview

Actions:
- create category
- edit category
- create definition
- edit definition
- delete definition

---

## 1.15 Achievement Definitions
Routes:
- /admin/achievements

Content:
- grouped by condition type
- threshold
- icon preview
- description

Actions:
- create
- edit
- delete

---

## 1.16 Medal Definitions
Routes:
- /admin/medals

Content:
- name
- type
- icon
- description

Actions:
- create
- edit
- delete
- manual award flows can live elsewhere later

---

## 1.17 Photos / Gallery Admin
Routes:
- /admin/photos
- optionally inside camp detail photo tab

Content:
- photo metadata list/grid
- create photo record
- delete photo record

Actions:
- add camp photo
- add team photo
- add player photo
- delete photo

---

## 1.18 Users
Routes:
- /admin/users

Super admin only.

Content:
- list of users
- role
- active status

Actions:
- create coach
- deactivate/activate user
- edit basic user info

---

# 2. Public Screens

## 2.1 Camp Public Page
Route:
- /camps/:campId

Content:
- camp hero
- title
- location
- dates
- description
- cover image
- camp type info
- links to rankings, teams, participants, photos

---

## 2.2 Camp Teams Public
Route:
- /camps/:campId/teams

Content:
- team cards
- color and logo
- points
- final position
- active status if relevant

---

## 2.3 Camp Participants Public
Route:
- /camps/:campId/participants

Content:
- participant cards
- avatar
- current team
- points
- kills
- survivals
- duel wins
- mass battle wins

---

## 2.4 Camp Rankings
Route:
- /camps/:campId/rankings

Content:
- tabs:
  - points
  - kills
  - survivals
  - teams

Use:
- rankings endpoints
- team standings endpoint

---

## 2.5 Player Public Profile
Route:
- /players/:playerId

Content:
- avatar
- name
- global totals
- participation timeline/cards
- ranks
- achievements
- medals
- current team per camp

---

## 2.6 Photo Galleries
Routes:
- can be integrated into camp page, team sections, player page

Content:
- photo grid
- image cards
- simple responsive layout

---

# 3. Screen Priorities

## Phase 1
- login
- app shell
- admin layout
- public layout

## Phase 2
- dashboard
- camp types
- team templates
- camps
- players

## Phase 3
- camp teams
- participations
- team assignments
- battles
- mass battle results
- duels
- scoring

## Phase 4
- rank definitions
- achievement definitions
- medal definitions
- photos

## Phase 5
- public camp page
- rankings
- player profile
- gallery

---

# 4. UX Requirements

## Admin
- mobile-first
- cards over tables
- clear action placement
- sticky save/apply/finalize actions
- minimal friction

## Public
- polished and clean
- readable rankings
- visually clear team identity
- clear progression display

---

# 5. Implementation Rule

Each screen should be implemented as a separate scoped task.

Do not combine:
- multiple major features
- multiple unrelated admin screens
- public and admin experiences in one task