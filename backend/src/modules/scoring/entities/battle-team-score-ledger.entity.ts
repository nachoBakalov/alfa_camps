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
import { Battle } from '../../battles/entities/battle.entity';
import { CampTeam } from '../../camp-teams/entities/camp-team.entity';

@Entity({ name: 'battle_team_score_ledger' })
@Index('IDX_battle_team_score_ledger_battle_id', ['battleId'])
@Index('IDX_battle_team_score_ledger_team_id', ['teamId'])
@Index('UQ_battle_team_score_ledger_battle_team', ['battleId', 'teamId'], { unique: true })
export class BattleTeamScoreLedger {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'battle_id' })
  battleId!: string;

  @ManyToOne(() => Battle, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'battle_id' })
  battle!: Battle;

  @Column({ type: 'uuid', name: 'team_id' })
  teamId!: string;

  @ManyToOne(() => CampTeam, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'team_id' })
  team!: CampTeam;

  @Column({ type: 'integer', name: 'team_points_delta', default: 0 })
  teamPointsDelta!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
