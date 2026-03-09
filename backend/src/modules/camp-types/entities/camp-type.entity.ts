import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Camp } from '../../camps/entities/camp.entity';
import { TeamTemplate } from '../../team-templates/entities/team-template.entity';

@Entity({ name: 'camp_types' })
export class CampType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', name: 'logo_url', nullable: true })
  logoUrl!: string | null;

  @Column({ type: 'varchar', name: 'cover_image_url', nullable: true })
  coverImageUrl!: string | null;

  @OneToMany(() => TeamTemplate, (teamTemplate) => teamTemplate.campType)
  teamTemplates!: TeamTemplate[];

  @OneToMany(() => Camp, (camp) => camp.campType)
  camps!: Camp[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
