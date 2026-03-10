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
import { Player } from '../../players/entities/player.entity';

@Entity({ name: 'camp_participations' })
@Index('IDX_camp_participations_camp_id', ['campId'])
@Index('IDX_camp_participations_player_id', ['playerId'])
@Index('UQ_camp_participations_camp_player', ['campId', 'playerId'], { unique: true })
export class CampParticipation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'camp_id' })
  campId!: string;

  @ManyToOne(() => Camp, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'camp_id' })
  camp!: Camp;

  @Column({ type: 'uuid', name: 'player_id' })
  playerId!: string;

  @ManyToOne(() => Player, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'player_id' })
  player!: Player;

  @Column({ type: 'integer', default: 0 })
  kills!: number;

  @Column({ type: 'integer', name: 'knife_kills', default: 0 })
  knifeKills!: number;

  @Column({ type: 'integer', default: 0 })
  survivals!: number;

  @Column({ type: 'integer', name: 'duel_wins', default: 0 })
  duelWins!: number;

  @Column({ type: 'integer', name: 'mass_battle_wins', default: 0 })
  massBattleWins!: number;

  @Column({ type: 'integer', default: 0 })
  points!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
