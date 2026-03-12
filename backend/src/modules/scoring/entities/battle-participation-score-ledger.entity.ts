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
import { CampParticipation } from '../../camp-participations/entities/camp-participation.entity';

@Entity({ name: 'battle_participation_score_ledger' })
@Index('IDX_battle_participation_score_ledger_battle_id', ['battleId'])
@Index('IDX_battle_participation_score_ledger_participation_id', ['participationId'])
@Index(
  'UQ_battle_participation_score_ledger_battle_participation',
  ['battleId', 'participationId'],
  { unique: true },
)
export class BattleParticipationScoreLedger {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'battle_id' })
  battleId!: string;

  @ManyToOne(() => Battle, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'battle_id' })
  battle!: Battle;

  @Column({ type: 'uuid', name: 'participation_id' })
  participationId!: string;

  @ManyToOne(() => CampParticipation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participation_id' })
  participation!: CampParticipation;

  @Column({ type: 'integer', name: 'kills_delta', default: 0 })
  killsDelta!: number;

  @Column({ type: 'integer', name: 'knife_kills_delta', default: 0 })
  knifeKillsDelta!: number;

  @Column({ type: 'integer', name: 'survivals_delta', default: 0 })
  survivalsDelta!: number;

  @Column({ type: 'integer', name: 'duel_wins_delta', default: 0 })
  duelWinsDelta!: number;

  @Column({ type: 'integer', name: 'mass_battle_wins_delta', default: 0 })
  massBattleWinsDelta!: number;

  @Column({ type: 'integer', name: 'points_delta', default: 0 })
  pointsDelta!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
