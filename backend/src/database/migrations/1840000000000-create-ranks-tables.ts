import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRanksTables1840000000000 implements MigrationInterface {
  name = 'CreateRanksTables1840000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "rank_categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying NOT NULL,
        "name" character varying NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_rank_categories_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_rank_categories_code" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "rank_definitions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "category_id" uuid NOT NULL,
        "name" character varying,
        "icon_url" character varying,
        "threshold" integer NOT NULL,
        "rank_order" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_rank_definitions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_rank_definitions_category_threshold" UNIQUE ("category_id", "threshold"),
        CONSTRAINT "UQ_rank_definitions_category_rank_order" UNIQUE ("category_id", "rank_order"),
        CONSTRAINT "FK_rank_definitions_category_id" FOREIGN KEY ("category_id") REFERENCES "rank_categories"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_rank_definitions_category_id" ON "rank_definitions" ("category_id")',
    );

    await queryRunner.query(`
      CREATE TABLE "player_ranks" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "participation_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "rank_definition_id" uuid NOT NULL,
        "unlocked_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_player_ranks_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_player_ranks_participation_category" UNIQUE ("participation_id", "category_id"),
        CONSTRAINT "FK_player_ranks_participation_id" FOREIGN KEY ("participation_id") REFERENCES "camp_participations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_player_ranks_category_id" FOREIGN KEY ("category_id") REFERENCES "rank_categories"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_player_ranks_rank_definition_id" FOREIGN KEY ("rank_definition_id") REFERENCES "rank_definitions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_player_ranks_participation_id" ON "player_ranks" ("participation_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_player_ranks_category_id" ON "player_ranks" ("category_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_player_ranks_rank_definition_id" ON "player_ranks" ("rank_definition_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_player_ranks_rank_definition_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_player_ranks_category_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_player_ranks_participation_id"');
    await queryRunner.query('DROP TABLE "player_ranks"');

    await queryRunner.query('DROP INDEX "public"."IDX_rank_definitions_category_id"');
    await queryRunner.query('DROP TABLE "rank_definitions"');

    await queryRunner.query('DROP TABLE "rank_categories"');
  }
}
