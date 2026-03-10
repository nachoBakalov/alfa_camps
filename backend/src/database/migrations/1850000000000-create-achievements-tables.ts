import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAchievementsTables1850000000000 implements MigrationInterface {
  name = 'CreateAchievementsTables1850000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."achievement_condition_type" AS ENUM('KILLS', 'SURVIVALS', 'DUEL_WINS', 'POINTS')
    `);

    await queryRunner.query(`
      CREATE TABLE "achievement_definitions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "description" text,
        "icon_url" character varying,
        "condition_type" "public"."achievement_condition_type" NOT NULL,
        "threshold" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_achievement_definitions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_achievement_definitions_condition_threshold_name" UNIQUE ("condition_type", "threshold", "name")
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_achievement_definitions_condition_type" ON "achievement_definitions" ("condition_type")',
    );

    await queryRunner.query(`
      CREATE TABLE "player_achievements" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "participation_id" uuid NOT NULL,
        "achievement_id" uuid NOT NULL,
        "unlocked_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_player_achievements_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_player_achievements_participation_achievement" UNIQUE ("participation_id", "achievement_id"),
        CONSTRAINT "FK_player_achievements_participation_id" FOREIGN KEY ("participation_id") REFERENCES "camp_participations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_player_achievements_achievement_id" FOREIGN KEY ("achievement_id") REFERENCES "achievement_definitions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_player_achievements_participation_id" ON "player_achievements" ("participation_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_player_achievements_achievement_id" ON "player_achievements" ("achievement_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_player_achievements_achievement_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_player_achievements_participation_id"');
    await queryRunner.query('DROP TABLE "player_achievements"');

    await queryRunner.query('DROP INDEX "public"."IDX_achievement_definitions_condition_type"');
    await queryRunner.query('DROP TABLE "achievement_definitions"');

    await queryRunner.query('DROP TYPE "public"."achievement_condition_type"');
  }
}
