import { CategoryEntity } from 'src/Entities/category.entity';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: CategoryEntity;
};

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  id: string;
};

export type FetchProductInput = {
  whereClause: string;
  params: (string | number)[];
};

export type ProductDetailsInput = {
  productId: string;
  categoryId: string;
};

export type ProductDetailsByNameAndId = {
  category_id: string;
  name: string;
};
