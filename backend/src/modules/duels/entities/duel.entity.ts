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

@Entity({ name: 'duels' })
@Index('IDX_duels_battle_id', ['battleId'])
@Index('IDX_duels_player_a_participation_id', ['playerAParticipationId'])
@Index('IDX_duels_player_b_participation_id', ['playerBParticipationId'])
@Index('IDX_duels_winner_participation_id', ['winnerParticipationId'])
export class Duel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'battle_id' })
  battleId!: string;

  @ManyToOne(() => Battle, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'battle_id' })
  battle!: Battle;

  @Column({ type: 'uuid', name: 'player_a_participation_id' })
  playerAParticipationId!: string;

  @ManyToOne(() => CampParticipation, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'player_a_participation_id' })
  playerAParticipation!: CampParticipation;

  @Column({ type: 'uuid', name: 'player_b_participation_id' })
  playerBParticipationId!: string;

  @ManyToOne(() => CampParticipation, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'player_b_participation_id' })
  playerBParticipation!: CampParticipation;

  @Column({ type: 'uuid', name: 'winner_participation_id', nullable: true })
  winnerParticipationId!: string | null;

  @ManyToOne(() => CampParticipation, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'winner_participation_id' })
  winnerParticipation!: CampParticipation | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
