import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlayerRank } from './player-rank.entity';
import { RankDefinition } from './rank-definition.entity';

@Entity({ name: 'rank_categories' })
@Index('UQ_rank_categories_code', ['code'], { unique: true })
export class RankCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  code!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @OneToMany(() => RankDefinition, (definition) => definition.category)
  definitions!: RankDefinition[];

  @OneToMany(() => PlayerRank, (playerRank) => playerRank.category)
  playerRanks!: PlayerRank[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
