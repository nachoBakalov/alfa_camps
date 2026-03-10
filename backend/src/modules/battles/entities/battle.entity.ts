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
import { CampTeam } from '../../camp-teams/entities/camp-team.entity';
import { User } from '../../users/entities/user.entity';
import { BattleSession } from '../enums/battle-session.enum';
import { BattleStatus } from '../enums/battle-status.enum';
import { BattleType } from '../enums/battle-type.enum';

@Entity({ name: 'battles' })
@Index('IDX_battles_camp_id', ['campId'])
@Index('IDX_battles_battle_type', ['battleType'])
@Index('IDX_battles_status', ['status'])
@Index('IDX_battles_battle_date', ['battleDate'])
@Index('IDX_battles_winning_team_id', ['winningTeamId'])
export class Battle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'camp_id' })
  campId!: string;

  @ManyToOne(() => Camp, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'camp_id' })
  camp!: Camp;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({
    type: 'enum',
    enum: BattleType,
    enumName: 'battle_type',
    name: 'battle_type',
  })
  battleType!: BattleType;

  @Column({ type: 'date', name: 'battle_date' })
  battleDate!: string;

  @Column({
    type: 'enum',
    enum: BattleSession,
    enumName: 'battle_session',
    nullable: true,
  })
  session!: BattleSession | null;

  @Column({ type: 'uuid', name: 'winning_team_id', nullable: true })
  winningTeamId!: string | null;

  @ManyToOne(() => CampTeam, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'winning_team_id' })
  winningTeam!: CampTeam | null;

  @Column({
    type: 'enum',
    enum: BattleStatus,
    enumName: 'battle_status',
    default: BattleStatus.DRAFT,
  })
  status!: BattleStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'timestamptz', name: 'completed_at', nullable: true })
  completedAt!: Date | null;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy!: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdByUser!: User | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
