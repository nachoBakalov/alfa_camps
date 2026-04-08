import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { BaseUuidEntity } from '../../../common/database/base-uuid.entity';

@Entity({ name: 'players' })
@Index('IDX_players_first_name', ['firstName'])
@Index('IDX_players_last_name', ['lastName'])
@Index('IDX_players_nickname', ['nickname'])
export class Player extends BaseUuidEntity {
  @Column({ type: 'varchar', name: 'first_name' })
  firstName!: string;

  @Column({ type: 'varchar', name: 'last_name', nullable: true })
  lastName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  nickname!: string | null;

  @Column({ type: 'varchar', name: 'avatar_url', nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
