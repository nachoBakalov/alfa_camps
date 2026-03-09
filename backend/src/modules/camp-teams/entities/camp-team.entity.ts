import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Camp } from '../../camps/entities/camp.entity';

@Entity({ name: 'camp_teams' })
export class CampTeam {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'camp_id' })
  campId!: string;

  @ManyToOne(() => Camp, (camp) => camp.campTeams, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'camp_id' })
  camp!: Camp;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  color!: string | null;

  @Column({ type: 'varchar', name: 'logo_url', nullable: true })
  logoUrl!: string | null;

  @Column({ type: 'integer', name: 'team_points', default: 0 })
  teamPoints!: number;

  @Column({ type: 'integer', name: 'final_position', nullable: true })
  finalPosition!: number | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
