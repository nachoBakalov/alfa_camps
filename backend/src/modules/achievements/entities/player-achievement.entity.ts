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
import { AchievementDefinition } from './achievement-definition.entity';

@Entity({ name: 'player_achievements' })
@Index('IDX_player_achievements_participation_id', ['participationId'])
@Index('IDX_player_achievements_achievement_id', ['achievementId'])
@Index('UQ_player_achievements_participation_achievement', ['participationId', 'achievementId'], {
  unique: true,
})
export class PlayerAchievement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'participation_id' })
  participationId!: string;

  @ManyToOne(() => CampParticipation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participation_id' })
  participation!: CampParticipation;

  @Column({ type: 'uuid', name: 'achievement_id' })
  achievementId!: string;

  @ManyToOne(() => AchievementDefinition, (achievement) => achievement.playerAchievements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'achievement_id' })
  achievement!: AchievementDefinition;

  @Column({ type: 'timestamptz', name: 'unlocked_at' })
  unlockedAt!: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
