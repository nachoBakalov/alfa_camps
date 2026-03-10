import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlayerMedal } from './player-medal.entity';
import { MedalType } from '../enums/medal-type.enum';

@Entity({ name: 'medal_definitions' })
@Index('UQ_medal_definitions_name', ['name'], { unique: true })
@Index('IDX_medal_definitions_type', ['type'])
export class MedalDefinition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @OneToMany(() => PlayerMedal, (playerMedal) => playerMedal.medal)
  playerMedals!: PlayerMedal[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
