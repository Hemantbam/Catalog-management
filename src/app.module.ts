import { Module } from '@nestjs/common';
import { CategoryModule } from './Modules/Category/category.module';
import { ProductModule } from './Modules/Product/product.module';
import { AttributeModule } from './Modules/Attribute/attribute.module';
import { AppDbModule } from './Database/app.typeOrm';
@Module({
  imports: [AppDbModule, CategoryModule, ProductModule, AttributeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
