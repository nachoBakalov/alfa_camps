import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCampFinalizationLedgerTable1830000000000 implements MigrationInterface {
  name = 'CreateCampFinalizationLedgerTable1830000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "camp_finalization_ledger" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "camp_id" uuid NOT NULL,
        "applied_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_camp_finalization_ledger_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_camp_finalization_ledger_camp_id" UNIQUE ("camp_id"),
        CONSTRAINT "FK_camp_finalization_ledger_camp_id" FOREIGN KEY ("camp_id") REFERENCES "camps"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "camp_finalization_ledger"');
  }
}
