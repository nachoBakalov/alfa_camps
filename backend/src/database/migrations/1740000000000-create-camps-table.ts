import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCampsTable1740000000000 implements MigrationInterface {
  name = 'CreateCampsTable1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."camp_status" AS ENUM('DRAFT', 'ACTIVE', 'FINISHED')`,
    );

    await queryRunner.query(`
      CREATE TABLE "camps" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "camp_type_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "year" integer NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "location" character varying,
        "description" text,
        "logo_url" character varying,
        "cover_image_url" character varying,
        "status" "public"."camp_status" NOT NULL DEFAULT 'DRAFT',
        "created_by" uuid,
        "finalized_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_camps_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_camps_camp_type_year_title" UNIQUE ("camp_type_id", "year", "title"),
        CONSTRAINT "FK_camps_camp_type_id" FOREIGN KEY ("camp_type_id") REFERENCES "camp_types"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_camps_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_camps_camp_type_id" ON "camps" ("camp_type_id")');
    await queryRunner.query('CREATE INDEX "IDX_camps_status" ON "camps" ("status")');
    await queryRunner.query('CREATE INDEX "IDX_camps_year" ON "camps" ("year")');
    await queryRunner.query('CREATE INDEX "IDX_camps_created_by" ON "camps" ("created_by")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_camps_created_by"');
    await queryRunner.query('DROP INDEX "public"."IDX_camps_year"');
    await queryRunner.query('DROP INDEX "public"."IDX_camps_status"');
    await queryRunner.query('DROP INDEX "public"."IDX_camps_camp_type_id"');
    await queryRunner.query('DROP TABLE "camps"');
    await queryRunner.query('DROP TYPE "public"."camp_status"');
  }
}
