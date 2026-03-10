import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CampTeam } from '../../camp-teams/entities/camp-team.entity';
import { Camp } from '../../camps/entities/camp.entity';
import { Player } from '../../players/entities/player.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'photos' })
@Index('IDX_photos_camp_id', ['campId'])
@Index('IDX_photos_team_id', ['teamId'])
@Index('IDX_photos_player_id', ['playerId'])
@Index('IDX_photos_uploaded_by', ['uploadedBy'])
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'camp_id', nullable: true })
  campId!: string | null;

  @ManyToOne(() => Camp, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'camp_id' })
  camp!: Camp | null;

  @Column({ type: 'uuid', name: 'team_id', nullable: true })
  teamId!: string | null;

  @ManyToOne(() => CampTeam, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'team_id' })
  team!: CampTeam | null;

  @Column({ type: 'uuid', name: 'player_id', nullable: true })
  playerId!: string | null;

  @ManyToOne(() => Player, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'player_id' })
  player!: Player | null;

  @Column({ type: 'varchar', name: 'image_url' })
  imageUrl!: string;

  @Column({ type: 'uuid', name: 'uploaded_by', nullable: true })
  uploadedBy!: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedByUser!: User | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
