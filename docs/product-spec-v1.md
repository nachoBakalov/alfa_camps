1. Общ преглед на системата
Системата е уеб приложение за управление на детски лагери, в които участниците се разделят на отбори и играят различни игри (битки).

Системата позволява:
управление на видове лагери
създаване на конкретни лагери
управление на играчи
управление на отбори
въвеждане на битки
автоматично изчисляване на статистика
система за rank / achievements / medals
публични класации и профили

Приложението има:
Admin/Coach панел (mobile first)
Public страници за статистики

2. Технологичен стек

Backend:
-NestJS
-PostgreSQL
-TypeORM

<!-- Frontend -->
Frontend:
- React
- Vite
- TypeScript
- Tailwind CSS

Админ панел:
Mobile-first
Public pages
част от React app

3. Потребителски роли
Super Admin

Може:
създава/редактира треньори
деактивира треньори
управлява camp types
управлява rank/achievement/medal definitions
вижда всички лагери
финализира лагери

Coach
Може:
създава лагер
управлява отбори
добавя играчи
създава битки
въвежда резултати
присъжда медали
качва снимки
вижда статистики
Всички треньори имат еднакви права.

4. Основни домейни

Основните обекти на системата са:
Users
Camp Types
Camps
Camp Teams
Players
Camp Participations
Team Assignment History
Battles
Battle Results
Rankings
Rank Definitions
Achievement Definitions
Medal Definitions
Player Achievements
Player Medals

5. Camp Types

Camp Type е шаблон за лагер.

Пример:
Игри на клановете
Войната на митичните
Четник
Camp Type съдържа:
name
description
logo
cover image
default team templates

6. Camps

Camp е конкретно събитие.
Пример:
Игри на клановете 2026
Camp съдържа:
camp type
title
year
start date
end date
location
information text
logo
cover image
status
Camp status:
draft
active
finished

7. Отбори (Camp Teams)

Всеки лагер има свои отбори.

Пример:

Игри на клановете:
Лъв (червен)
Орел (бял)
Козел (зелен)
Бивол (син)
Camp Team съдържа:
name
color
logo
team points
final position

Отборите могат да се:
добавят
редактират
премахват

8. Players

Player е глобален профил на дете.

Player съдържа:

first name

last name / nickname

avatar

createdAt

Играчът може да участва в много лагери.

9. Camp Participation

Camp Participation свързва:

Player ↔ Camp

Participation съдържа:

player

camp

joinedAt

statistics

current ranks by category

Статистиките са за конкретния лагер.

Camp participation cached stats:
- kills
- knife_kills
- survivals
- duel_wins
- mass_battle_wins
- points


10. Team Assignment History

Играч може да смени отбор по време на лагер.

Затова системата пази история:

Team Assignment съдържа:

player participation

team

assignedAt

changedBy

При добавяне на играч към лагер се създава initial assignment.

11. Добавяне на играч към лагер

Coach → Camp → Players → Add player

Възможности:

Добавяне на съществуващ играч

Flow:

търсене по име

избор на играч

избор на отбор

save

Създаване на нов играч

Fields:

name

avatar

team

При save:

създава се Player

създава се Participation

създава се initial Team Assignment

12. Battles

Battle представлява игра/битка, в която участват играчи.

Battle съдържа:

camp

title

battle type

date

session (morning / afternoon / evening)

status

Battle status:

draft

completed

cancelled

13. Видове битки

V1 има два типа:

Mass Battle

Участват всички играчи.

Въвеждат се:

победил отбор

kills за всеки играч

survival за всеки играч

1vs1 Session

Съдържа множество duels.

Всеки duel съдържа:

player A

player B

winner

Mass battle win rule:
- If a team wins a mass battle, all participating players from that team receive:
   - +1 mass_battle_win
  - +3 individual points
- This does not depend on whether the player survived.

Mass battle player result fields:
- kills
- knife_kills
- survived

14. Scoring System
Kill

1 kill = 1 point

Survival

survival = 2 points

Team Victory (Mass Battle)

победил отбор:

team gets 3 team points

всеки участващ играч от този отбор получава +1 mass_battle_win

всеки играч от този отбор получава 3 individual points

тези бонуси не зависят от survival

1vs1

winner:

+1 win

+1 point

Final Camp Ranking

След края на лагера:

1 място → 7 точки
2 място → 5 точки
3 място → 3 точки
4+ място → 1 точка

14.1 Progression Model

Progression in V1 is split into three distinct systems:

- Rank: current level per category for a camp participation.
- Achievement: threshold-based milestone support remains available in backend, but it is not treated as a core active progression direction in the current product track.
- Medal: special recognition badge, manual or automatic.

15. Rank System



The system supports multiple rank categories.

Each player participation can have one current rank per category.

V1 rank categories:

1. KILLS_RANK
   thresholds:
   - 1
   - 5
   - 10
   - 15
   - 20
   - 25
   - 30
   - 35
   - 40

2. MASS_BATTLE_WINS_RANK
   thresholds:
   - 1
   - 2
   - 3
   - 4
   - 5
   - 6
   - 7
   - 8
   - 9

3. CHALLENGE_WINS_RANK
   thresholds:
   - 1
   - 2
   - 3
   - 4
   - 5
   - 6
   - 7
   - 8
   - 9

4. SURVIVALS_RANK
   thresholds:
   - 1
   - 2
   - 3
   - 4
   - 5
   - 6
   - 7
   - 8
   - 9

Important rules:
- A player can hold one current rank per category.
- Rank progress is camp-scoped.
- Rank images are stored in the frontend public folder.
- Backend stores only icon/image path.

16. Achievements

Achievement е автоматично отключено постижение.

Achievement definition съдържа:

name

description

icon

condition type

threshold

Пример:

5 kills

10 kills

3 survivals

5 duel wins

Achievements се отключват автоматично.

17. Medals

Medal е специална награда.

Тип `AUTO` е future-facing и не трябва да се счита за напълно автоматичен без изрична auto-award rule логика.

Medal definition съдържа:

name

description

icon

type

Type:

manual

automatic

V1 използва основно manual medals.

18. Присъждане на медал

Coach → Camp → Players → Player profile → Award medal

Fields:

medal

note

awarded by

date

19. Завършване на битка

При mark as completed:

Системата:

записва резултатите

изчислява точки

обновява player stats

проверява achievements

обновява ranks by category

20. Финализиране на лагер

Coach / Admin → Camp → Finalize

Системата:

проверява final team ranking

дава placement points

заключва лагера

status = finished

След това лагерът е архивиран.

21. Public страници
Camp page

Показва:

информация

отбори

снимки

топ 10 точки

топ 10 kills

топ 10 survival

team standings

Player profile

Показва:

avatar

name

общи статистики

участие по лагери

achievements

medals

22. Admin панел

Admin интерфейсът е mobile-first.

Основни страници:

Dashboard

Camps

Players

Battles

Rankings

Gallery

Users

23. Основен принцип на системата

Системата не съхранява само крайни числа.

Тя съхранява:

battles

battle results

player events

От тях се изчисляват статистиките.

24. Архитектурен принцип

Всички статистики са camp scoped.

Global статистиките се изчисляват чрез aggregation.

25. Основни UX принципи

Admin панел:

mobile first

cards вместо tables

големи бутони

минимален текст

sticky save actions

26. Development правила

При работа с AI tools (Codex):

всяка задача трябва да е малка

ясно дефинирана

без промени извън scope

без “генериране на цялото приложение наведнъж”

27. Development phases

Phase 1
Core backend

Phase 2
Camp / players domain

Phase 3
Battle system

Phase 4
Scoring system

Phase 5
Rank / achievements

Phase 6
Admin UI

Phase 7
Public pages

28. V1 medal definitions:

1. Лъвско сърце
   condition: mass_battle_wins >= 3

2. Железен кръст
   condition: kills >= 40

3. Безсмъртен войн
   condition: survivals >= 9

4. Командо
   condition: duel_wins >= 7

5. Ура
   condition: knife_kills >= 10

