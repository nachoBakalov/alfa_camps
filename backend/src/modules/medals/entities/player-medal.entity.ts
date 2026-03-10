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
import { CampParticipation } from '../../camp-participations/entities/camp-participation.entity';
import { User } from '../../users/entities/user.entity';
import { MedalDefinition } from './medal-definition.entity';

@Entity({ name: 'player_medals' })
@Index('IDX_player_medals_participation_id', ['participationId'])
@Index('IDX_player_medals_medal_id', ['medalId'])
@Index('IDX_player_medals_awarded_by', ['awardedBy'])
@Index('UQ_player_medals_participation_medal', ['participationId', 'medalId'], {
  unique: true,
})
export class PlayerMedal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'participation_id' })
  participationId!: string;

  @ManyToOne(() => CampParticipation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participation_id' })
  participation!: CampParticipation;

  @Column({ type: 'uuid', name: 'medal_id' })
  medalId!: string;

  @ManyToOne(() => MedalDefinition, (medal) => medal.playerMedals, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'medal_id' })
  medal!: MedalDefinition;

  @Column({ type: 'uuid', name: 'awarded_by', nullable: true })
  awardedBy!: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'awarded_by' })
  awardedByUser!: User | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ type: 'timestamptz', name: 'awarded_at' })
  awardedAt!: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
