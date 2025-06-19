import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { SALT_ROUNDS } from '../constants';
import { Organization } from './organization.entity';

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn('uuid', { name: 'api_key_id' })
  apiKeyId: string;

  @Column()
  key: string;

  @Column()
  secret: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt: Date;

  @OneToOne(() => Organization, { cascade: ['remove'], onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'organization_id',
    referencedColumnName: 'organizationId',
  })
  organization: Organization;

  @BeforeInsert()
  async hashSecret() {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.secret = await bcrypt.hash(this.secret, salt);
  }
}
