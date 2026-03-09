import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCampTypesTable1720000000000 implements MigrationInterface {
  name = 'CreateCampTypesTable1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "camp_types" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "logo_url" character varying,
        "cover_image_url" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_camp_types_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_camp_types_name" UNIQUE ("name"),
        CONSTRAINT "UQ_camp_types_slug" UNIQUE ("slug")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "camp_types"');
  }
}
