import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { AttributeEntity } from './attribute.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  // Establishes a many-to-one relationship between products and categories.
  // Each product belongs to a single category, but a category can have multiple products.
  @ManyToOne(() => CategoryEntity, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  // Establishes a one-to-many relationship with attributes.
  // A product can have multiple attributes (e.g., color, size).
  @OneToMany(() => AttributeEntity, (attribute) => attribute.product, {
    cascade: true,
  })
  attributes: AttributeEntity[];
}
