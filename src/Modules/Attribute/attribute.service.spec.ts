import { Test, TestingModule } from '@nestjs/testing';
import { AttributeService } from './attribute.service';
import { AttributeRepository } from 'src/Repository/attribute.repository';
import { ProductRepository } from 'src/Repository/product.repository';
import { ResponseHandler } from 'src/Utils/responseHandler.utils';
import { ProductDto } from '../Product/product.dto';
import { faker } from '@faker-js/faker/.';
import { AttributeDto } from './attribute.dto';
import { CategoryEntity } from 'src/Entities/category.entity';
import { ProductEntity } from 'src/Entities/product.entity';

describe('AttributeService', () => {
  let attributeService: AttributeService;
  let attributeRepository: AttributeRepository;
  let productRepository: ProductRepository;

  let attributeDto: AttributeDto;
  let productDto: ProductDto;
  let productId: string;
  let attributeId: string;
  beforeEach(async () => {
    productId = faker.string.uuid();
    attributeId = faker.string.uuid();

    productDto = {
      name: faker.commerce.productName().toLowerCase(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
    };

    attributeDto = {
      key: faker.color.human(),
      value: faker.commerce.productMaterial(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttributeService,
        ResponseHandler,
        {
          provide: AttributeRepository,
          useValue: {
            fetchAttributeDataWithKeyAndProductIdInDb: jest.fn(),
            addNewAttributeInDb: jest.fn(),
            fetchAttributeDataByIdInDb: jest.fn(),
            updateAttributeDataInDb: jest.fn(),
            deleteAttributeDataFromDb: jest.fn(),
            fetchProductDetailsWithAttributeIdAndProductId: jest.fn(),
          },
        },
        {
          provide: ProductRepository,
          useValue: {
            productDetailsByIdInDb: jest.fn(),
          },
        },
      ],
    }).compile();

    attributeService = module.get<AttributeService>(AttributeService);
    attributeRepository = module.get<AttributeRepository>(AttributeRepository);
    productRepository = module.get<ProductRepository>(ProductRepository);
  });

  describe('addNewAttribute', () => {
    it('should return 404 if no product details are found', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue(null);

      const result = await attributeService.addNewAttribute(
        productId,
        attributeDto,
      );

      expect(result).toEqual({
        success: false,
        status: 404,
        message: 'Invalid product id, No Details found',
        details: null,
      });
    });

    it('should return 409 if the attribute key already exists', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue([
          {
            id: productId,
            name: productDto.name,
            description: productDto.description,
            price: productDto.price,
            category: new CategoryEntity(),
            attributes: [],
          },
        ]);
      jest
        .spyOn(attributeRepository, 'fetchAttributeDataWithKeyAndProductIdInDb')
        .mockResolvedValue([
          {
            id: attributeId,
            product: new ProductEntity(),
            key: attributeDto.key,
            value: attributeDto.value,
          },
        ]);

      const result = await attributeService.addNewAttribute(
        productId,
        attributeDto,
      );
      expect(result).toEqual({
        success: false,
        status: 409,
        message: `${attributeDto.key} key attribute is already registered with the provided id ${productId}`,
        details: null,
      });
    });

    it('should return 200 if the attribute is added successfully', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue([
          {
            id: productId,
            name: productDto.name,
            description: productDto.description,
            price: productDto.price,
            category: new CategoryEntity(),
            attributes: [],
          },
        ]);
      jest
        .spyOn(attributeRepository, 'fetchAttributeDataWithKeyAndProductIdInDb')
        .mockResolvedValue(null);
      jest
        .spyOn(attributeRepository, 'addNewAttributeInDb')
        .mockResolvedValue(true);

      const result = await attributeService.addNewAttribute(
        productId,
        attributeDto,
      );
      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Attribute successfully added to the database',
        details: null,
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockImplementation(() => {
          throw new Error('Unexpected database error');
        });

      const result = await attributeService.addNewAttribute(
        productId,
        attributeDto,
      );

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Internal server error',
        details: ['Unexpected database error'],
      });
    });
  });

  describe('updateAttribute', () => {
    it('should return 404 if the product is not found', async () => {
      jest
        .spyOn(
          attributeRepository,
          'fetchProductDetailsWithAttributeIdAndProductId',
        )
        .mockResolvedValue([null]);

      const result = await attributeService.updateAttribute(
        attributeId,
        productId,
        attributeDto,
      );

      expect(result).toEqual({
        success: false,
        status: 404,
        message: 'Invalid product id, No Details found',
        details: null,
      });
    });

    it('should return 409 if the attribute id with the attribute key is not linked with the product id', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue([
          {
            id: productId,
            name: productDto.name,
            description: productDto.description,
            price: productDto.price,
            category: new CategoryEntity(),
            attributes: [],
          },
        ]);
      jest
        .spyOn(attributeRepository, 'fetchAttributeDataByIdInDb')
        .mockResolvedValue([
          {
            id: attributeId,
            product: new ProductEntity(),
            key: attributeDto.key,
            value: attributeDto.value,
          },
        ]);
      jest
        .spyOn(attributeRepository, 'fetchAttributeDataWithKeyAndProductIdInDb')
        .mockResolvedValue([
          {
            id: attributeId,
            product: {
              id: productId,
              name: productDto.name,
              description: productDto.description,
              price: productDto.price,
              category: new CategoryEntity(),
              attributes: [],
            },
            key: attributeDto.key,
            value: attributeDto.value,
          },
        ]);

      const result = await attributeService.updateAttribute(
        attributeId,
        productId,
        attributeDto,
      );
      expect(result).toEqual({
        success: false,
        status: 409,
        message: `Conflict: Product id of ${productId} is not linked with attribute id of ${attributeId}`,
        details: null,
      });
    });

    it('should update the attribute successfully', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue([
          {
            id: productId,
            name: productDto.name,
            description: productDto.description,
            price: productDto.price,
            category: new CategoryEntity(),
            attributes: [],
          },
        ]);
      jest
        .spyOn(attributeRepository, 'fetchAttributeDataByIdInDb')
        .mockResolvedValue([
          {
            id: attributeId,
            product: {
              id: productId,
              name: productDto.name,
              description: productDto.description,
              price: productDto.price,
              category: new CategoryEntity(),
              attributes: [],
            },
            key: attributeDto.key,
            value: attributeDto.value,
          },
        ]);
      jest
        .spyOn(
          attributeRepository,
          'fetchProductDetailsWithAttributeIdAndProductId',
        )
        .mockResolvedValue([
          {
            id: attributeId,
            product: {
              id: productId,
              name: productDto.name,
              description: productDto.description,
              price: productDto.price,
              category: new CategoryEntity(),
              attributes: [],
            },
            key: attributeDto.key,
            value: attributeDto.value,
          },
        ]);
      jest
        .spyOn(attributeRepository, 'updateAttributeDataInDb')
        .mockResolvedValue(true);

      const result = await attributeService.updateAttribute(
        attributeId,
        productId,
        attributeDto,
      );
      expect(result).toEqual({
        success: true,
        status: 200,
        message: `Key '${attributeDto.key}' with value '${attributeDto.value}' data updated successfully to the database of attribute id ${attributeId}`,
        details: null,
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockImplementation(() => {
          throw new Error('Unexpected database error');
        });

      const result = await attributeService.updateAttribute(
        attributeId,
        productId,
        attributeDto,
      );

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Internal server error',
        details: ['Unexpected database error'],
      });
    });
  });

  describe('deleteAttribute', () => {
    it('should return 404 if the product detail is not found', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue(null);
      jest
        .spyOn(attributeRepository, 'fetchAttributeDataByIdInDb')
        .mockResolvedValue([
          {
            id: attributeId,
            product: new ProductEntity(),
            key: attributeDto.key,
            value: attributeDto.value,
          },
        ]);

      const result = await attributeService.deleteAttribute(
        productId,
        attributeId,
      );
      expect(result).toEqual({
        success: false,
        status: 404,
        message: `No Details found for the product id ${productId}`,
        details: null,
      });
    });

    it('should return 404 if the attribute is not found', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue([
          {
            id: productId,
            name: productDto.name,
            description: productDto.description,
            price: productDto.price,
            category: new CategoryEntity(),
            attributes: [],
          },
        ]);
      jest
        .spyOn(attributeRepository, 'fetchAttributeDataByIdInDb')
        .mockResolvedValue(null);
      const result = await attributeService.deleteAttribute(
        productId,
        attributeId,
      );

      expect(result).toEqual({
        success: false,
        status: 404,
        message: `No Details found for the attribute id ${attributeId}`,
        details: null,
      });
    });

    it('should return 409 if the attribute ID does not belong to the product ID', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue([
          {
            id: productId,
            name: productDto.name,
            description: productDto.description,
            price: productDto.price,
            category: new CategoryEntity(),
            attributes: [],
          },
        ]);

      jest
        .spyOn(attributeRepository, 'fetchAttributeDataByIdInDb')
        .mockResolvedValue([
          {
            id: attributeId,
            product: new ProductEntity(),
            key: attributeDto.key,
            value: attributeDto.value,
          },
        ]);
      const result = await attributeService.deleteAttribute(
        productId,
        attributeId,
      );

      expect(result).toEqual({
        success: false,
        status: 409,
        message: `The attribute ID ${attributeId} does not belong to the product with ID ${productId}. Please verify the attribute ID and ensure it matches the product you are trying to delete.`,
        details: null,
      });
    });

    it('should return 200 if attribute belongs to the correct product and is successfully deleted', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue([
          {
            id: productId,
            name: productDto.name,
            description: productDto.description,
            price: productDto.price,
            category: new CategoryEntity(),
            attributes: [],
          },
        ]);
      jest
        .spyOn(attributeRepository, 'fetchAttributeDataByIdInDb')
        .mockResolvedValue([
          {
            id: attributeId,
            product: {
              id: productId,
              name: productDto.name,
              description: productDto.description,
              price: productDto.price,
              category: new CategoryEntity(),
              attributes: [],
            },
            key: attributeDto.key,
            value: attributeDto.value,
          },
        ]);

      jest
        .spyOn(attributeRepository, 'deleteAttributeDataFromDb')
        .mockResolvedValue(true);

      const result = await attributeService.deleteAttribute(
        productId,
        attributeId,
      );

      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Attribute data deleted successfully',
        details: null,
      });
    });

    it('should return 500 if an unexpected error occurs', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockImplementation(() => {
          throw new Error('Unexpected database error');
        });

      const result = await attributeService.deleteAttribute(
        productId,
        attributeId,
      );

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Internal server error',
        details: ['Unexpected database error'],
      });
    });
  });
});
