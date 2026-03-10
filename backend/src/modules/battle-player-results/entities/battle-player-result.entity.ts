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
import { CampTeam } from '../../camp-teams/entities/camp-team.entity';

@Entity({ name: 'battle_player_results' })
@Index('IDX_battle_player_results_battle_id', ['battleId'])
@Index('IDX_battle_player_results_participation_id', ['participationId'])
@Index('IDX_battle_player_results_team_id', ['teamId'])
@Index('UQ_battle_player_results_battle_participation', ['battleId', 'participationId'], {
  unique: true,
})
export class BattlePlayerResult {
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

  @Column({ type: 'uuid', name: 'team_id' })
  teamId!: string;

  @ManyToOne(() => CampTeam, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'team_id' })
  team!: CampTeam;

  @Column({ type: 'integer', default: 0 })
  kills!: number;

  @Column({ type: 'integer', name: 'knife_kills', default: 0 })
  knifeKills!: number;

  @Column({ type: 'boolean', default: false })
  survived!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
