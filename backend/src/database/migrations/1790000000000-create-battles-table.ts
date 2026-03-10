import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBattlesTable1790000000000 implements MigrationInterface {
  name = 'CreateBattlesTable1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."battle_type" AS ENUM('MASS_BATTLE', 'DUEL_SESSION')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."battle_status" AS ENUM('DRAFT', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."battle_session" AS ENUM('MORNING', 'AFTERNOON', 'EVENING')`,
    );

    await queryRunner.query(`
      CREATE TABLE "battles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "camp_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "battle_type" "public"."battle_type" NOT NULL,
        "battle_date" date NOT NULL,
        "session" "public"."battle_session",
        "winning_team_id" uuid,
        "status" "public"."battle_status" NOT NULL DEFAULT 'DRAFT',
        "notes" text,
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "created_by" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_battles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_battles_camp_id" FOREIGN KEY ("camp_id") REFERENCES "camps"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_battles_winning_team_id" FOREIGN KEY ("winning_team_id") REFERENCES "camp_teams"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_battles_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_battles_camp_id" ON "battles" ("camp_id")');
    await queryRunner.query(
      'CREATE INDEX "IDX_battles_battle_type" ON "battles" ("battle_type")',
    );
    await queryRunner.query('CREATE INDEX "IDX_battles_status" ON "battles" ("status")');
    await queryRunner.query(
      'CREATE INDEX "IDX_battles_battle_date" ON "battles" ("battle_date")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_battles_winning_team_id" ON "battles" ("winning_team_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_battles_winning_team_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_battles_battle_date"');
    await queryRunner.query('DROP INDEX "public"."IDX_battles_status"');
    await queryRunner.query('DROP INDEX "public"."IDX_battles_battle_type"');
    await queryRunner.query('DROP INDEX "public"."IDX_battles_camp_id"');
    await queryRunner.query('DROP TABLE "battles"');
    await queryRunner.query('DROP TYPE "public"."battle_session"');
    await queryRunner.query('DROP TYPE "public"."battle_status"');
    await queryRunner.query('DROP TYPE "public"."battle_type"');
  }
}
