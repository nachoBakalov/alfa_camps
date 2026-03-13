import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMedalAutoAwardFields1880000000000 implements MigrationInterface {
  name = 'AddMedalAutoAwardFields1880000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE "public"."medal_auto_award_condition_type" AS ENUM(
          'KILLS',
          'KNIFE_KILLS',
          'SURVIVALS',
          'DUEL_WINS',
          'MASS_BATTLE_WINS'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END
      $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "medal_definitions"
      ADD COLUMN "condition_type" "public"."medal_auto_award_condition_type",
      ADD COLUMN "threshold" integer
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_medal_definitions_condition_type" ON "medal_definitions" ("condition_type")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_medal_definitions_condition_type"');

    await queryRunner.query(`
      ALTER TABLE "medal_definitions"
      DROP COLUMN "threshold",
      DROP COLUMN "condition_type"
    `);

    await queryRunner.query('DROP TYPE "public"."medal_auto_award_condition_type"');
  }
}
