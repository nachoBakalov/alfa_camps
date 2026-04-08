import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { BaseUuidEntity } from '../../../common/database/base-uuid.entity';
import { Camp } from '../../camps/entities/camp.entity';

@Entity({ name: 'camp_finalization_ledger' })
@Index('UQ_camp_finalization_ledger_camp_id', ['campId'], { unique: true })
export class CampFinalizationLedger extends BaseUuidEntity {
  @Column({ type: 'uuid', name: 'camp_id' })
  campId!: string;

  @ManyToOne(() => Camp, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'camp_id' })
  camp!: Camp;

  @Column({ type: 'timestamptz', name: 'applied_at' })
  appliedAt!: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
