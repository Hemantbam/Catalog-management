import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { CategoryEntity } from './src/Entities/category.entity';
import { ProductEntity } from './src/Entities/product.entity';
import { AttributeEntity } from './src/Entities/attribute.entity';

dotenv.config({ path: '.env.db' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [CategoryEntity, ProductEntity, AttributeEntity],
  migrations: ['src/Migrations/*.ts'],
  synchronize: false,
});
