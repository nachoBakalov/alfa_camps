import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlayersTable1760000000000 implements MigrationInterface {
  name = 'CreatePlayersTable1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "players" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "first_name" character varying NOT NULL,
        "last_name" character varying,
        "nickname" character varying,
        "avatar_url" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_players_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_players_first_name" ON "players" ("first_name")');
    await queryRunner.query('CREATE INDEX "IDX_players_last_name" ON "players" ("last_name")');
    await queryRunner.query('CREATE INDEX "IDX_players_nickname" ON "players" ("nickname")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_players_nickname"');
    await queryRunner.query('DROP INDEX "public"."IDX_players_last_name"');
    await queryRunner.query('DROP INDEX "public"."IDX_players_first_name"');
    await queryRunner.query('DROP TABLE "players"');
  }
}
