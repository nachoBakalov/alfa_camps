import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCampTeamsTable1750000000000 implements MigrationInterface {
  name = 'CreateCampTeamsTable1750000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "camp_teams" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "camp_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "color" character varying,
        "logo_url" character varying,
        "team_points" integer NOT NULL DEFAULT 0,
        "final_position" integer,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_camp_teams_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_camp_teams_camp_name" UNIQUE ("camp_id", "name"),
        CONSTRAINT "FK_camp_teams_camp_id" FOREIGN KEY ("camp_id") REFERENCES "camps"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_camp_teams_camp_id" ON "camp_teams" ("camp_id")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_camp_teams_camp_id"');
    await queryRunner.query('DROP TABLE "camp_teams"');
  }
}
