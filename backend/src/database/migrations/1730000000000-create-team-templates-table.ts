import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamTemplatesTable1730000000000 implements MigrationInterface {
  name = 'CreateTeamTemplatesTable1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "team_templates" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "camp_type_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "color" character varying,
        "logo_url" character varying,
        "sort_order" integer,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_team_templates_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_team_templates_camp_type_name" UNIQUE ("camp_type_id", "name"),
        CONSTRAINT "FK_team_templates_camp_type_id" FOREIGN KEY ("camp_type_id") REFERENCES "camp_types"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_team_templates_camp_type_id" ON "team_templates" ("camp_type_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_team_templates_camp_type_id"');
    await queryRunner.query('DROP TABLE "team_templates"');
  }
}
