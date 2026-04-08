import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  } from 'typeorm';
import { BaseUuidEntity } from '../../../common/database/base-uuid.entity';
import { CampType } from '../../camp-types/entities/camp-type.entity';

@Entity({ name: 'team_templates' })
export class TeamTemplate extends BaseUuidEntity {
  @Column({ type: 'uuid', name: 'camp_type_id' })
  campTypeId!: string;

  @ManyToOne(() => CampType, (campType) => campType.teamTemplates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'camp_type_id' })
  campType!: CampType;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  color!: string | null;

  @Column({ type: 'varchar', name: 'logo_url', nullable: true })
  logoUrl!: string | null;

  @Column({ type: 'integer', name: 'sort_order', nullable: true })
  sortOrder!: number | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
