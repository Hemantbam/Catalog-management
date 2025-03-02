import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../Entities/product.entity';
import {
  ProductInput,
  FetchProductInput,
  ProductDetailsInput,
  ProductDetailsByNameAndId,
} from 'src/types/product.type';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async addProduct({
    name,
    description,
    price,
    id,
  }: ProductInput): Promise<boolean> {
    const newProduct = this.productRepository.create({
      name,
      description,
      price,
      category: { id },
    });
    const result = await this.productRepository.save(newProduct);
    return result ? true : false;
  }

  async productDetailsByNameInDb(
    name: string,
  ): Promise<ProductEntity[] | null> {
    const result = await this.productRepository.find({
      where: { name },
    });
    return result.length > 0 ? result : null;
  }

  async productDetailsByNameAndCategoryIdInDb({
    name,
    category_id,
  }: ProductDetailsByNameAndId): Promise<ProductEntity[] | null> {
    const result = await this.productRepository.find({
      where: { name: name, category: { id: category_id } },
      relations: ['category'],
    });
    return result.length > 0 ? result : null;
  }

  async fetchProductDetailsWithProductIdAndCategoryId({
    productId,
    categoryId,
  }: ProductDetailsInput): Promise<ProductEntity[] | null> {
    const result = await this.productRepository.find({
      where: {
        id: productId,
        category: { id: categoryId },
      },
      relations: ['category', 'attributes'],
    });
    return result.length > 0 ? result : null;
  }

  async productDetailsByIdInDb(id: string): Promise<ProductEntity[] | null> {
    const result = await this.productRepository.find({
      where: { id },
      relations: ['category'],
    });
    return result.length > 0 ? result : null;
  }

  async updateProductDetailsInDb({
    name,
    description,
    price,
    id,
  }: ProductInput): Promise<boolean> {
    const result = await this.productRepository.update(id, {
      name,
      description,
      price,
    });
    return result.affected > 0 ? true : false;
  }

  async deleteProductDetailsByIdInDb(id: string): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return result.affected > 0 ? true : false;
  }

  async fetchProductDetailsByNameInDb(
    name: string,
  ): Promise<ProductEntity[] | null> {
    const result = await this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.attributes', 'a')
      .leftJoinAndSelect('p.category', 'c')
      .where('p.name LIKE :name', { name: `%${name}%` })
      .getMany();
    return result.length > 0 ? result : null;
  }

  async fetchAllProductDetailsInDb(): Promise<ProductEntity[] | null> {
    const result = await this.productRepository.find();
    return result.length > 0 ? result : null;
  }

  async fetchProductDetailsByProductCategoryAndAttributeNameInDb({
    whereClause,
    params,
  }: FetchProductInput): Promise<ProductEntity[] | null> {
    const baseQuery = `
      SELECT 
        p.*, 
        a.key AS attribute_key, 
        a.value AS attribute_value, 
        c.name AS category_name, 
        c.parent_id AS parent_category_id
      FROM products p
      LEFT JOIN attributes a ON p.id = a.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}`;
    const result = await this.productRepository.query(baseQuery, params);
    return result.length > 0 ? result : null;
  }
}
