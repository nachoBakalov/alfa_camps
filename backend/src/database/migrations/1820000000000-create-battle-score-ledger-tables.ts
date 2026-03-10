import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBattleScoreLedgerTables1820000000000 implements MigrationInterface {
  name = 'CreateBattleScoreLedgerTables1820000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "battle_participation_score_ledger" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "battle_id" uuid NOT NULL,
        "participation_id" uuid NOT NULL,
        "kills_delta" integer NOT NULL DEFAULT 0,
        "knife_kills_delta" integer NOT NULL DEFAULT 0,
        "survivals_delta" integer NOT NULL DEFAULT 0,
        "duel_wins_delta" integer NOT NULL DEFAULT 0,
        "mass_battle_wins_delta" integer NOT NULL DEFAULT 0,
        "points_delta" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_battle_participation_score_ledger_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_battle_participation_score_ledger_battle_participation" UNIQUE ("battle_id", "participation_id"),
        CONSTRAINT "FK_battle_participation_score_ledger_battle_id" FOREIGN KEY ("battle_id") REFERENCES "battles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_battle_participation_score_ledger_participation_id" FOREIGN KEY ("participation_id") REFERENCES "camp_participations"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_battle_participation_score_ledger_battle_id" ON "battle_participation_score_ledger" ("battle_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_battle_participation_score_ledger_participation_id" ON "battle_participation_score_ledger" ("participation_id")',
    );

    await queryRunner.query(`
      CREATE TABLE "battle_team_score_ledger" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "battle_id" uuid NOT NULL,
        "team_id" uuid NOT NULL,
        "team_points_delta" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_battle_team_score_ledger_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_battle_team_score_ledger_battle_team" UNIQUE ("battle_id", "team_id"),
        CONSTRAINT "FK_battle_team_score_ledger_battle_id" FOREIGN KEY ("battle_id") REFERENCES "battles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_battle_team_score_ledger_team_id" FOREIGN KEY ("team_id") REFERENCES "camp_teams"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_battle_team_score_ledger_battle_id" ON "battle_team_score_ledger" ("battle_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_battle_team_score_ledger_team_id" ON "battle_team_score_ledger" ("team_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_battle_team_score_ledger_team_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_battle_team_score_ledger_battle_id"');
    await queryRunner.query('DROP TABLE "battle_team_score_ledger"');

    await queryRunner.query('DROP INDEX "public"."IDX_battle_participation_score_ledger_participation_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_battle_participation_score_ledger_battle_id"');
    await queryRunner.query('DROP TABLE "battle_participation_score_ledger"');
  }
}
