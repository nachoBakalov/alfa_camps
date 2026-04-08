import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { BaseUuidEntity } from '../../../common/database/base-uuid.entity';
import { PlayerRank } from './player-rank.entity';
import { RankDefinition } from './rank-definition.entity';

@Entity({ name: 'rank_categories' })
@Index('UQ_rank_categories_code', ['code'], { unique: true })
export class RankCategory extends BaseUuidEntity {
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
