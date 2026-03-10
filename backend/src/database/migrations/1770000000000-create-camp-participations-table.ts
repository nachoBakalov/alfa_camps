import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCampParticipationsTable1770000000000
  implements MigrationInterface
{
  name = 'CreateCampParticipationsTable1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "camp_participations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "camp_id" uuid NOT NULL,
        "player_id" uuid NOT NULL,
        "kills" integer NOT NULL DEFAULT 0,
        "knife_kills" integer NOT NULL DEFAULT 0,
        "survivals" integer NOT NULL DEFAULT 0,
        "duel_wins" integer NOT NULL DEFAULT 0,
        "mass_battle_wins" integer NOT NULL DEFAULT 0,
        "points" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_camp_participations_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_camp_participations_camp_player" UNIQUE ("camp_id", "player_id"),
        CONSTRAINT "FK_camp_participations_camp_id" FOREIGN KEY ("camp_id") REFERENCES "camps"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_camp_participations_player_id" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_camp_participations_camp_id" ON "camp_participations" ("camp_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_camp_participations_player_id" ON "camp_participations" ("player_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_camp_participations_player_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_camp_participations_camp_id"');
    await queryRunner.query('DROP TABLE "camp_participations"');
  }
}
