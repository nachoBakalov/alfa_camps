import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlayerRank } from './player-rank.entity';
import { RankCategory } from './rank-category.entity';

@Entity({ name: 'rank_definitions' })
@Index('IDX_rank_definitions_category_id', ['categoryId'])
@Index('UQ_rank_definitions_category_threshold', ['categoryId', 'threshold'], { unique: true })
@Index('UQ_rank_definitions_category_rank_order', ['categoryId', 'rankOrder'], { unique: true })
export class RankDefinition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId!: string;

  @ManyToOne(() => RankCategory, (category) => category.definitions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category!: RankCategory;

  @Column({ type: 'varchar', nullable: true })
  name!: string | null;

  @Column({ type: 'varchar', name: 'icon_url', nullable: true })
  iconUrl!: string | null;

  @Column({ type: 'integer' })
  threshold!: number;

  @Column({ type: 'integer', name: 'rank_order' })
  rankOrder!: number;

  @OneToMany(() => PlayerRank, (playerRank) => playerRank.rankDefinition)
  playerRanks!: PlayerRank[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
