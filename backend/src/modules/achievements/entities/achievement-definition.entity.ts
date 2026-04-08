import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { BaseUuidEntity } from '../../../common/database/base-uuid.entity';
import { PlayerAchievement } from './player-achievement.entity';
import { AchievementConditionType } from '../enums/achievement-condition-type.enum';

@Entity({ name: 'achievement_definitions' })
@Index('IDX_achievement_definitions_condition_type', ['conditionType'])
@Index('UQ_achievement_definitions_condition_threshold_name', ['conditionType', 'threshold', 'name'], {
  unique: true,
})
export class AchievementDefinition extends BaseUuidEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', name: 'icon_url', nullable: true })
  iconUrl!: string | null;

  @Column({
    type: 'enum',
    enum: AchievementConditionType,
    enumName: 'achievement_condition_type',
    name: 'condition_type',
  })
  conditionType!: AchievementConditionType;

  @Column({ type: 'integer' })
  threshold!: number;

  @OneToMany(() => PlayerAchievement, (playerAchievement) => playerAchievement.achievement)
  playerAchievements!: PlayerAchievement[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
