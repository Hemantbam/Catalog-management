import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from 'src/Repository/category.repository';
import { ResponseHandler } from 'src/Utils/responseHandler.utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/Entities/category.entity';
@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, ResponseHandler],
})
export class CategoryModule {}
