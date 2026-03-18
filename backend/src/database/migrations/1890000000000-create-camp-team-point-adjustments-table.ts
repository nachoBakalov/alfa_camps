import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCampTeamPointAdjustmentsTable1890000000000 implements MigrationInterface {
  name = 'CreateCampTeamPointAdjustmentsTable1890000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "camp_team_point_adjustments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "camp_team_id" uuid NOT NULL,
        "delta" integer NOT NULL,
        "reason" text,
        "created_by" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_camp_team_point_adjustments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_camp_team_point_adjustments_camp_team_id" FOREIGN KEY ("camp_team_id") REFERENCES "camp_teams"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_camp_team_point_adjustments_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_camp_team_point_adjustments_camp_team_id" ON "camp_team_point_adjustments" ("camp_team_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_camp_team_point_adjustments_created_by" ON "camp_team_point_adjustments" ("created_by")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_camp_team_point_adjustments_created_by"');
    await queryRunner.query('DROP INDEX "public"."IDX_camp_team_point_adjustments_camp_team_id"');
    await queryRunner.query('DROP TABLE "camp_team_point_adjustments"');
  }
}
