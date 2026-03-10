
# Backend Architecture

This document defines the backend folder structure for the project.

The AI coding assistant must follow this structure strictly and must not invent alternative layouts.

Tech stack:
- NestJS
- PostgreSQL
- TypeORM
- TypeScript

---

# Root Structure


src/
  main.ts
  app.module.ts

  common/
    config/
      env.validation.ts
      typeorm.config.ts
    constants/
    decorators/
      roles.decorator.ts
      current-user.decorator.ts
    dto/
    enums/
    guards/
      jwt-auth.guard.ts
      roles.guard.ts
    interfaces/
    types/
    utils/

  database/
    migrations/
    seeds/

  modules/
    auth/
      dto/
        login.dto.ts
      interfaces/
        jwt-payload.interface.ts
        authenticated-user.interface.ts
      auth.controller.ts
      auth.module.ts
      auth.service.ts
      jwt.strategy.ts

    health/
      health.controller.ts
      health.module.ts
      health.service.ts

    users/
      dto/
        create-user.dto.ts
        update-user.dto.ts
      entities/
        user.entity.ts
      enums/
        user-role.enum.ts
      users.controller.ts
      users.module.ts
      users.service.ts

    camp-types/
      dto/
      entities/
      camp-types.controller.ts
      camp-types.module.ts
      camp-types.service.ts

    team-templates/
      dto/
      entities/
      team-templates.controller.ts
      team-templates.module.ts
      team-templates.service.ts

    camps/
      dto/
      entities/
      camps.controller.ts
      camps.module.ts
      camps.service.ts

    camp-teams/
      dto/
      entities/
      camp-teams.controller.ts
      camp-teams.module.ts
      camp-teams.service.ts

    players/
      dto/
      entities/
      players.controller.ts
      players.module.ts
      players.service.ts

    participations/
      dto/
      entities/
      participations.controller.ts
      participations.module.ts
      participations.service.ts

    team-assignments/
      dto/
      entities/
      team-assignments.controller.ts
      team-assignments.module.ts
      team-assignments.service.ts

    battles/
      dto/
      entities/
      battles.controller.ts
      battles.module.ts
      battles.service.ts

    battle-results/
      dto/
      entities/
      battle-results.controller.ts
      battle-results.module.ts
      battle-results.service.ts

    duels/
      dto/
      entities/
      duels.controller.ts
      duels.module.ts
      duels.service.ts

    ranks/
      dto/
      entities/
      ranks.controller.ts
      ranks.module.ts
      ranks.service.ts

    achievements/
      dto/
      entities/
      achievements.controller.ts
      achievements.module.ts
      achievements.service.ts

    medals/
      dto/
      entities/
      medals.controller.ts
      medals.module.ts
      medals.service.ts

    rankings/
      dto/
      rankings.controller.ts
      rankings.module.ts
      rankings.service.ts

    photos/
      dto/
      entities/
      photos.controller.ts
      photos.module.ts
      photos.service.ts