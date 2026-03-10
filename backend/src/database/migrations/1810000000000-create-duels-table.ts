import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDuelsTable1810000000000 implements MigrationInterface {
  name = 'CreateDuelsTable1810000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "duels" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "battle_id" uuid NOT NULL,
        "player_a_participation_id" uuid NOT NULL,
        "player_b_participation_id" uuid NOT NULL,
        "winner_participation_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_duels_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_duels_players_distinct" CHECK ("player_a_participation_id" <> "player_b_participation_id"),
        CONSTRAINT "FK_duels_battle_id" FOREIGN KEY ("battle_id") REFERENCES "battles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_duels_player_a_participation_id" FOREIGN KEY ("player_a_participation_id") REFERENCES "camp_participations"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_duels_player_b_participation_id" FOREIGN KEY ("player_b_participation_id") REFERENCES "camp_participations"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_duels_winner_participation_id" FOREIGN KEY ("winner_participation_id") REFERENCES "camp_participations"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_duels_battle_id" ON "duels" ("battle_id")');
    await queryRunner.query(
      'CREATE INDEX "IDX_duels_player_a_participation_id" ON "duels" ("player_a_participation_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_duels_player_b_participation_id" ON "duels" ("player_b_participation_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_duels_winner_participation_id" ON "duels" ("winner_participation_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_duels_winner_participation_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_duels_player_b_participation_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_duels_player_a_participation_id"');
    await queryRunner.query('DROP INDEX "public"."IDX_duels_battle_id"');
    await queryRunner.query('DROP TABLE "duels"');
  }
}
