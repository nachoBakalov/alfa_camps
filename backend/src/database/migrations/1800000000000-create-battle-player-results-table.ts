import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBattlePlayerResultsTable1800000000000
  implements MigrationInterface
{
  name = 'CreateBattlePlayerResultsTable1800000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "battle_player_results" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "battle_id" uuid NOT NULL,
        "participation_id" uuid NOT NULL,
        "team_id" uuid NOT NULL,
        "kills" integer NOT NULL DEFAULT 0,
        "knife_kills" integer NOT NULL DEFAULT 0,
        "survived" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_battle_player_results_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_battle_player_results_battle_participation" UNIQUE ("battle_id", "participation_id"),
        CONSTRAINT "FK_battle_player_results_battle_id" FOREIGN KEY ("battle_id") REFERENCES "battles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_battle_player_results_participation_id" FOREIGN KEY ("participation_id") REFERENCES "camp_participations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_battle_player_results_team_id" FOREIGN KEY ("team_id") REFERENCES "camp_teams"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_battle_player_results_battle_id" ON "battle_player_results" ("battle_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_battle_player_results_participation_id" ON "battle_player_results" ("participation_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_battle_player_results_team_id" ON "battle_player_results" ("team_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_battle_player_results_team_id"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_battle_player_results_participation_id"',
    );
    await queryRunner.query('DROP INDEX "public"."IDX_battle_player_results_battle_id"');
    await queryRunner.query('DROP TABLE "battle_player_results"');
  }
}
