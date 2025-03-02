import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductRepository } from 'src/Repository/product.repository';
import { AttributeRepository } from 'src/Repository/attribute.repository';
import { ProductController } from './product.controller';
import { CategoryRepository } from 'src/Repository/category.repository';
import { ResponseHandler } from 'src/Utils/responseHandler.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/Entities/category.entity';
import { ProductEntity } from 'src/Entities/product.entity';
import { AttributeEntity } from 'src/Entities/attribute.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, ProductEntity, AttributeEntity]),
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    CategoryRepository,
    AttributeRepository,
    ResponseHandler,
  ],
})
export class ProductModule {}
