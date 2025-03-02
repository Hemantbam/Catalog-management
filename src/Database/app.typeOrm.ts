import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/Entities/category.entity';
import { ProductEntity } from 'src/Entities/product.entity';
import { AttributeEntity } from 'src/Entities/attribute.entity';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.db',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const AppDataSource = new DataSource({
          type: 'postgres',
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          entities: [CategoryEntity, ProductEntity, AttributeEntity],
          synchronize: false, 
        });

        await AppDataSource.initialize();
        return AppDataSource.options; 
      },
    }),
  ],
})
export class AppDbModule {}
