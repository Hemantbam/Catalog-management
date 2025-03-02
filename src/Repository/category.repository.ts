import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { CategoryEntity } from '../Entities/category.entity';
import { CategoryInput } from 'src/types/category.types';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async addNewCategoryInDb(name: string): Promise<boolean> {
    const category = new CategoryEntity();
    category.name = name;

    const result = await this.categoryRepository.save(category);
    return result ? true : false;
  }

  async addSubCategoryInDb({ id, name }: CategoryInput): Promise<boolean> {
    const category = new CategoryEntity();
    category.name = name;
    category.parent = await this.categoryRepository.findOne({
      where: { id: id },
    });

    const result = await this.categoryRepository.save(category);
    return result ? true : false;
  }

  async categoryDetailByNameFromDb(
    name: string,
  ): Promise<CategoryEntity[] | null> {
    const result = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .where('category.name = :name', { name })
      .andWhere('category.parent_id IS NULL')
      .getMany();
    return result.length > 0 ? result : null;
  }

  async subCategoryNameOfCategoryIdFromDb({
    id,
    name,
  }: CategoryInput): Promise<CategoryEntity[] | null> {
    const result = await this.categoryRepository.find({
      where: { name, parent: Equal(id) },
    });
    return result.length > 0 ? result : null;
  }

  async subCategoryNameFromDb(name: string): Promise<CategoryEntity[] | null> {
    const result = await this.categoryRepository.find({
      where: { name: name },
      relations: ['parent'],
    });
    return result.length > 0 ? result : null;
  }

  async updateCategoryNameInDb({ id, name }: CategoryInput): Promise<boolean> {
    const category = await this.categoryRepository.findOne({
      where: { id: id },
    });
    if (!category) return false;

    category.name = name;
    const result = await this.categoryRepository.save(category);
    return result ? true : false;
  }

  async categoryDetailsByIdFromDb(
    id: string,
  ): Promise<CategoryEntity[] | null> {
    const result = await this.categoryRepository.find({
      where: { id: id },
      relations: ['parent', 'children'],
    });
    return result.length > 0 ? result : null;
  }

  async deleteCategoryDetailsInDb(id: string): Promise<boolean> {
    const result = await this.categoryRepository.delete(id);
    return result.affected > 0 ? true : false;
  }

  async fetchAllCategoryAndSubCategoryDetailsByIdInDb(
    id: string,
  ): Promise<CategoryEntity[] | null> {
    const query = `
      WITH RECURSIVE CategoryHierarchy AS (
        SELECT * FROM categories WHERE id = $1
        UNION ALL
        SELECT c.id, c.name, c.parent_id
        FROM categories c
        INNER JOIN CategoryHierarchy ch ON c.parent_id = ch.id
      )
      SELECT * FROM CategoryHierarchy;
    `;

    const result = await this.categoryRepository.query(query, [id]);
    return result.length > 0 ? result : null;
  }
}
