import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { BaseUuidEntity } from '../../../common/database/base-uuid.entity';
import { PlayerMedal } from './player-medal.entity';
import { MedalAutoAwardConditionType } from '../enums/medal-auto-award-condition-type.enum';
import { MedalType } from '../enums/medal-type.enum';

@Entity({ name: 'medal_definitions' })
@Index('UQ_medal_definitions_name', ['name'], { unique: true })
@Index('IDX_medal_definitions_type', ['type'])
@Index('IDX_medal_definitions_condition_type', ['conditionType'])
export class MedalDefinition extends BaseUuidEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', name: 'icon_url', nullable: true })
  iconUrl!: string | null;

  @Column({
    type: 'enum',
    enum: MedalType,
    enumName: 'medal_type',
  })
  type!: MedalType;

  @Column({
    type: 'enum',
    enum: MedalAutoAwardConditionType,
    enumName: 'medal_auto_award_condition_type',
    name: 'condition_type',
    nullable: true,
  })
  conditionType!: MedalAutoAwardConditionType | null;

  @Column({ type: 'integer', nullable: true })
  threshold!: number | null;

  @OneToMany(() => PlayerMedal, (playerMedal) => playerMedal.medal)
  playerMedals!: PlayerMedal[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
