import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePhotosTable1870000000000 implements MigrationInterface {
  name = 'CreatePhotosTable1870000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "photos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "camp_id" uuid,
        "team_id" uuid,
        "player_id" uuid,
        "image_url" character varying NOT NULL,
        "uploaded_by" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_photos_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_photos_camp_id" ON "photos" ("camp_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_photos_team_id" ON "photos" ("team_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_photos_player_id" ON "photos" ("player_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_photos_uploaded_by" ON "photos" ("uploaded_by")',
    );

    await queryRunner.query(`
      ALTER TABLE "photos"
      ADD CONSTRAINT "FK_photos_camp_id"
      FOREIGN KEY ("camp_id") REFERENCES "camps"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "photos"
      ADD CONSTRAINT "FK_photos_team_id"
      FOREIGN KEY ("team_id") REFERENCES "camp_teams"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "photos"
      ADD CONSTRAINT "FK_photos_player_id"
      FOREIGN KEY ("player_id") REFERENCES "players"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "photos"
      ADD CONSTRAINT "FK_photos_uploaded_by"
      FOREIGN KEY ("uploaded_by") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "photos" DROP CONSTRAINT "FK_photos_uploaded_by"');
    await queryRunner.query('ALTER TABLE "photos" DROP CONSTRAINT "FK_photos_player_id"');
    await queryRunner.query('ALTER TABLE "photos" DROP CONSTRAINT "FK_photos_team_id"');
    await queryRunner.query('ALTER TABLE "photos" DROP CONSTRAINT "FK_photos_camp_id"');

    await queryRunner.query('DROP INDEX "public"."IDX_photos_uploaded_by"');
    await queryRunner.query('DROP INDEX "public"."IDX_photos_player_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_photos_team_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_photos_camp_id"');

    await queryRunner.query('DROP TABLE "photos"');
  }
}
