import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  // A self-referencing relationship is established here to support category hierarchy (parent-child structure).
  // This is useful when categories need to be nested, like in a multi-level category system (e.g., product categories in an e-commerce store).
  @ManyToOne(() => CategoryEntity, (category) => category.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: CategoryEntity;

  //This defines the one-to-many relationship where a category can have multiple child categories.
  //It allows fetching all subcategories of a given category
  @OneToMany(() => CategoryEntity, (category) => category.parent)
  children: CategoryEntity[];
}
