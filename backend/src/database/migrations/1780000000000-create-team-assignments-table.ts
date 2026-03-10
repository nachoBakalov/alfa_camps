import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamAssignmentsTable1780000000000
  implements MigrationInterface
{
  name = 'CreateTeamAssignmentsTable1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "team_assignments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "participation_id" uuid NOT NULL,
        "team_id" uuid NOT NULL,
        "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "assigned_by" uuid,
        "note" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_team_assignments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_team_assignments_participation_id" FOREIGN KEY ("participation_id") REFERENCES "camp_participations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_team_assignments_team_id" FOREIGN KEY ("team_id") REFERENCES "camp_teams"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_team_assignments_assigned_by" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_team_assignments_participation_id" ON "team_assignments" ("participation_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_team_assignments_team_id" ON "team_assignments" ("team_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_team_assignments_assigned_at" ON "team_assignments" ("assigned_at")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_team_assignments_assigned_at"');
    await queryRunner.query('DROP INDEX "public"."IDX_team_assignments_team_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_team_assignments_participation_id"');
    await queryRunner.query('DROP TABLE "team_assignments"');
  }
}
