import { randomUUID } from 'crypto';
import { BeforeInsert, PrimaryColumn } from 'typeorm';

export abstract class BaseUuidEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @BeforeInsert()
  protected assignId(): void {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
