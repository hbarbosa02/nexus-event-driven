import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('examples')
export class ExampleEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
