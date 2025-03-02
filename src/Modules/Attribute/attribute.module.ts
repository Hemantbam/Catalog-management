import { Module } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { AttributeRepository } from 'src/Repository/attribute.repository';
import { AttributeController } from './attribute.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from 'src/Repository/product.repository';
import { ResponseHandler } from 'src/Utils/responseHandler.utils';
import { AttributeEntity } from 'src/Entities/attribute.entity';
import { ProductEntity } from 'src/Entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttributeEntity, ProductEntity])],
  controllers: [AttributeController],
  providers: [
    AttributeService,
    AttributeRepository,
    ProductRepository,
    ResponseHandler,
  ],
})
export class AttributeModule {}
