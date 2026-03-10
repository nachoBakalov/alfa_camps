import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Camp } from '../../camps/entities/camp.entity';

@Entity({ name: 'camp_finalization_ledger' })
@Index('UQ_camp_finalization_ledger_camp_id', ['campId'], { unique: true })
export class CampFinalizationLedger {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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
