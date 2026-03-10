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
import { RankCategory } from './rank-category.entity';
import { RankDefinition } from './rank-definition.entity';

@Entity({ name: 'player_ranks' })
@Index('IDX_player_ranks_participation_id', ['participationId'])
@Index('IDX_player_ranks_category_id', ['categoryId'])
@Index('IDX_player_ranks_rank_definition_id', ['rankDefinitionId'])
@Index('UQ_player_ranks_participation_category', ['participationId', 'categoryId'], {
  unique: true,
})
export class PlayerRank {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'participation_id' })
  participationId!: string;

  @ManyToOne(() => CampParticipation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participation_id' })
  participation!: CampParticipation;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId!: string;

  @ManyToOne(() => RankCategory, (category) => category.playerRanks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category!: RankCategory;

  @Column({ type: 'uuid', name: 'rank_definition_id' })
  rankDefinitionId!: string;

  @ManyToOne(() => RankDefinition, (definition) => definition.playerRanks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rank_definition_id' })
  rankDefinition!: RankDefinition;

  @Column({ type: 'timestamptz', name: 'unlocked_at' })
  unlockedAt!: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
