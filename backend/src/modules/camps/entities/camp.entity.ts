import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CampTeam } from '../../camp-teams/entities/camp-team.entity';
import { CampType } from '../../camp-types/entities/camp-type.entity';
import { User } from '../../users/entities/user.entity';
import { CampStatus } from '../enums/camp-status.enum';

@Entity({ name: 'camps' })
export class Camp {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'camp_type_id' })
  campTypeId!: string;

  @ManyToOne(() => CampType, (campType) => campType.camps, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'camp_type_id' })
  campType!: CampType;

  @OneToMany(() => CampTeam, (campTeam) => campTeam.camp)
  campTeams!: CampTeam[];

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'integer' })
  year!: number;

  @Column({ type: 'date', name: 'start_date' })
  startDate!: string;

  @Column({ type: 'date', name: 'end_date' })
  endDate!: string;

  @Column({ type: 'varchar', nullable: true })
  location!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', name: 'logo_url', nullable: true })
  logoUrl!: string | null;

  @Column({ type: 'varchar', name: 'cover_image_url', nullable: true })
  coverImageUrl!: string | null;

  @Column({
    type: 'enum',
    enum: CampStatus,
    enumName: 'camp_status',
    default: CampStatus.DRAFT,
  })
  status!: CampStatus;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy!: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdByUser!: User | null;

  @Column({ type: 'timestamptz', name: 'finalized_at', nullable: true })
  finalizedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
