import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('attributes')
export class AttributeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Establishes a many-to-one relationship between attributes and products.
  // Each attribute belongs to a single product, but a product can have multiple attributes.
  @ManyToOne(() => ProductEntity, (product) => product.attributes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'varchar', length: 255 })
  key: string;

  @Column({ type: 'varchar', length: 255 })
  value: string;
}
