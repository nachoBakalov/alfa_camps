import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMedalsTables1860000000000 implements MigrationInterface {
  name = 'CreateMedalsTables1860000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."medal_type" AS ENUM('MANUAL', 'AUTO')
    `);

    await queryRunner.query(`
      CREATE TABLE "medal_definitions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "description" text,
        "icon_url" character varying,
        "type" "public"."medal_type" NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_medal_definitions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_medal_definitions_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_medal_definitions_type" ON "medal_definitions" ("type")');

    await queryRunner.query(`
      CREATE TABLE "player_medals" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "participation_id" uuid NOT NULL,
        "medal_id" uuid NOT NULL,
        "awarded_by" uuid,
        "note" text,
        "awarded_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_player_medals_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_player_medals_participation_medal" UNIQUE ("participation_id", "medal_id"),
        CONSTRAINT "FK_player_medals_participation_id" FOREIGN KEY ("participation_id") REFERENCES "camp_participations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_player_medals_medal_id" FOREIGN KEY ("medal_id") REFERENCES "medal_definitions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_player_medals_awarded_by" FOREIGN KEY ("awarded_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_player_medals_participation_id" ON "player_medals" ("participation_id")');
    await queryRunner.query('CREATE INDEX "IDX_player_medals_medal_id" ON "player_medals" ("medal_id")');
    await queryRunner.query('CREATE INDEX "IDX_player_medals_awarded_by" ON "player_medals" ("awarded_by")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_player_medals_awarded_by"');
    await queryRunner.query('DROP INDEX "public"."IDX_player_medals_medal_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_player_medals_participation_id"');
    await queryRunner.query('DROP TABLE "player_medals"');

    await queryRunner.query('DROP INDEX "public"."IDX_medal_definitions_type"');
    await queryRunner.query('DROP TABLE "medal_definitions"');

    await queryRunner.query('DROP TYPE "public"."medal_type"');
  }
}
