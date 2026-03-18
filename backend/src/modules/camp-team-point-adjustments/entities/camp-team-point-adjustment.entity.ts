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
import { CampTeam } from '../../camp-teams/entities/camp-team.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'camp_team_point_adjustments' })
@Index('IDX_camp_team_point_adjustments_camp_team_id', ['campTeamId'])
@Index('IDX_camp_team_point_adjustments_created_by', ['createdBy'])
export class CampTeamPointAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'camp_team_id' })
  campTeamId!: string;

  @ManyToOne(() => CampTeam, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'camp_team_id' })
  campTeam!: CampTeam;

  @Column({ type: 'integer' })
  delta!: number;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy!: string | null;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdByUser!: User | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
