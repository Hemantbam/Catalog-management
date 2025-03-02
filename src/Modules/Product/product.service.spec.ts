import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepository } from 'src/Repository/product.repository';
import { CategoryRepository } from 'src/Repository/category.repository';
import { ProductDto } from './product.dto';
import { CategoryDto } from '../Category/category.dto';
import { ResponseHandler } from 'src/Utils/responseHandler.utils';
import { faker } from '@faker-js/faker';
import { CategoryEntity } from 'src/Entities/category.entity';
import { ProductEntity } from 'src/Entities/product.entity';
import { AttributeDto } from '../Attribute/attribute.dto';

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: ProductRepository;
  let categoryRepository: CategoryRepository;

  let productDto: ProductDto;
  let categoryDto: CategoryDto;
  let productId: string;
  let categoryId: string;
  let attributeId: string;
  let attributeDto: AttributeDto;

  beforeEach(async () => {
    productId = faker.string.uuid();
    categoryId = faker.string.uuid();
    attributeId = faker.string.uuid();
    productDto = {
      name: faker.commerce.productName().toLowerCase(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
    };

    attributeDto = {
      key: faker.commerce.productMaterial().toLowerCase(),
      value: faker.color.human().toLowerCase(),
    };

    categoryDto = {
      name: faker.commerce.department().toLowerCase(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        ResponseHandler,
        {
          provide: ProductRepository,
          useValue: {
            productDetailsByNameAndCategoryIdInDb: jest.fn(),
            addProduct: jest.fn(),
            productDetailsByIdInDb: jest.fn(),
            productDetailsByNameInDb: jest.fn(),
            updateProductDetailsInDb: jest.fn(),
            deleteProductDetailsByIdInDb: jest.fn(),
            fetchProductDetailsWithProductIdAndCategoryId: jest.fn(),
            fetchProductDetailsByProductCategoryAndAttributeNameInDb: jest.fn(),
          },
        },
        {
          provide: CategoryRepository,
          useValue: {
            categoryDetailsByIdFromDb: jest.fn(),
          },
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get<ProductRepository>(ProductRepository);
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  describe('addNewProduct', () => {
    it('should add a new product successfully', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: categoryDto.name,
            parent: new CategoryEntity(),
            children: [],
          },
        ]);
      jest
        .spyOn(productRepository, 'productDetailsByNameAndCategoryIdInDb')
        .mockResolvedValue(null);
      jest.spyOn(productRepository, 'addProduct').mockResolvedValue(true);

      const result = await productService.addNewProduct(categoryId, productDto);
      expect(
        productRepository.productDetailsByNameAndCategoryIdInDb,
      ).toHaveBeenCalledWith({
        name: productDto.name,
        category_id: categoryId,
      });
      expect(productRepository.addProduct).toHaveBeenCalledWith({
        name: productDto.name,
        description: productDto.description,
        price: productDto.price,
        id: categoryId,
      });
      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Product added successfully.',
        details: null,
      });
    });

    it('should return conflict error when product name already exists in category', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: categoryDto.name,
            parent: new CategoryEntity(),
            children: [],
          },
        ]);
      jest
        .spyOn(productRepository, 'productDetailsByNameAndCategoryIdInDb')
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

      const result = await productService.addNewProduct(categoryId, productDto);

      expect(result).toEqual({
        success: false,
        status: 409,
        message: `Product with name '${productDto.name}' already exists in the category id ${categoryId}`,
        details: null,
      });
    });

    it('should return error when adding a product fails', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: categoryDto.name,
            parent: new CategoryEntity(),
            children: [],
          },
        ]);
      jest
        .spyOn(productRepository, 'productDetailsByNameAndCategoryIdInDb')
        .mockResolvedValue(null);
      jest.spyOn(productRepository, 'addProduct').mockResolvedValue(null);

      const result = await productService.addNewProduct(categoryId, productDto);

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Failed to add the product.',
        details: null,
      });
    });

    it('should handle unexpected errors', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: categoryDto.name,
            parent: new CategoryEntity(),
            children: [],
          },
        ]);
      jest
        .spyOn(productRepository, 'productDetailsByNameAndCategoryIdInDb')
        .mockResolvedValue(null);
      jest.spyOn(productRepository, 'addProduct').mockImplementation(() => {
        throw new Error('Internal server error');
      });

      const result = await productService.addNewProduct(categoryId, productDto);

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Internal server error',
        details: ['Internal server error'],
      });
    });
  });

  describe('updateProductDetails', () => {
    it('should return not found response if product does not exist', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue(null);

      const result = await productService.updateProductDetails(
        productId,
        productDto,
      );

      expect(result).toEqual({
        success: false,
        status: 404,
        message: 'Product not found for the provided id.',
        details: null,
      });

      expect(productRepository.productDetailsByIdInDb).toHaveBeenCalledWith(
        productId,
      );
    });

    it('should return conflict response if product name is already in use by another product in the same category', async () => {
      const conflictingProduct = {
        id: faker.string.uuid(),
        name: productDto.name,
      };
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue([
          {
            id: productId,
            category: { id: categoryId },
          } as ProductEntity,
        ]);
      jest
        .spyOn(productRepository, 'productDetailsByNameAndCategoryIdInDb')
        .mockResolvedValue([conflictingProduct as ProductEntity]);

      const result = await productService.updateProductDetails(
        productId,
        productDto,
      );

      expect(result).toEqual({
        success: false,
        status: 409,
        message: `Conflict: The product name '${productDto.name}' is already in use with the category of id ${categoryId}`,
        details: null,
      });
      expect(
        productRepository.productDetailsByNameAndCategoryIdInDb,
      ).toHaveBeenCalledWith({
        name: productDto.name,
        category_id: categoryId,
      });
    });

    it('should return conflict response if product is not linked with the provided category', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue([
          {
            id: productId,
            category: { id: categoryId },
          } as ProductEntity,
        ]);
      jest
        .spyOn(productRepository, 'productDetailsByNameAndCategoryIdInDb')
        .mockResolvedValue([]);
      jest
        .spyOn(
          productRepository,
          'fetchProductDetailsWithProductIdAndCategoryId',
        )
        .mockResolvedValue(null);

      const result = await productService.updateProductDetails(
        productId,
        productDto,
      );

      expect(result).toEqual({
        success: false,
        status: 409,
        message: `Conflict: Product id of ${productId} is not linked with category id of ${categoryId}`,
        details: null,
      });

      expect(
        productRepository.fetchProductDetailsWithProductIdAndCategoryId,
      ).toHaveBeenCalledWith({
        productId,
        categoryId,
      });
    });

    it('should return bad request response if product update fails', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue([{ id: productId } as ProductEntity]);
      jest
        .spyOn(productRepository, 'productDetailsByNameAndCategoryIdInDb')
        .mockResolvedValue([]);
      jest
        .spyOn(
          productRepository,
          'fetchProductDetailsWithProductIdAndCategoryId',
        )
        .mockResolvedValue([{ id: productId } as ProductEntity]);
      jest
        .spyOn(productRepository, 'updateProductDetailsInDb')
        .mockResolvedValue(null);

      const result = await productService.updateProductDetails(
        productId,
        productDto,
      );

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Failed to update the product.',
        details: null,
      });
      expect(productRepository.updateProductDetailsInDb).toHaveBeenCalledWith({
        id: productId,
        name: productDto.name,
        description: productDto.description,
        price: productDto.price,
      });
    });

    it('should return success response if product is updated successfully', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue([{ id: productId } as ProductEntity]);
      jest
        .spyOn(productRepository, 'productDetailsByNameAndCategoryIdInDb')
        .mockResolvedValue([]);
      jest
        .spyOn(
          productRepository,
          'fetchProductDetailsWithProductIdAndCategoryId',
        )
        .mockResolvedValue([{ id: productId } as ProductEntity]);
      jest
        .spyOn(productRepository, 'updateProductDetailsInDb')
        .mockResolvedValue(true);

      const result = await productService.updateProductDetails(
        productId,
        productDto,
      );

      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Product updated successfully.',
        details: null,
      });
      expect(productRepository.updateProductDetailsInDb).toHaveBeenCalledWith({
        id: productId,
        name: productDto.name,
        description: productDto.description,
        price: productDto.price,
      });
    });

    it('should return unexpected error response if an error occurs', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockImplementation(() => {
          throw new Error('Database connection error');
        });

      const result = await productService.updateProductDetails(
        productId,
        productDto,
      );

      expect(result).toEqual({
        success: false,
        status: 500,
        message: `Internal server error`,
        details: ['Database connection error'],
      });
    });
  });

  describe('deleteProductDetails', () => {
    it('should delete a product successfully', async () => {
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
        .spyOn(productRepository, 'deleteProductDetailsByIdInDb')
        .mockResolvedValue(true);
      const result = await productService.deleteProductDetails(productId);

      expect(productRepository.productDetailsByIdInDb).toHaveBeenCalledWith(
        productId,
      );
      expect(
        productRepository.deleteProductDetailsByIdInDb,
      ).toHaveBeenCalledWith(productId);

      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Product deleted successfully.',
        details: null,
      });
    });

    it('should return error if product ID is invalid', async () => {
      jest
        .spyOn(productRepository, 'productDetailsByIdInDb')
        .mockResolvedValue(null);

      const result = await productService.deleteProductDetails(productId);

      expect(productRepository.productDetailsByIdInDb).toHaveBeenCalledWith(
        productId,
      );

      expect(result).toEqual({
        success: false,
        status: 404,
        message: 'Product not found for the provided id.',
        details: null,
      });
    });

    it('should return error if deletion fails', async () => {
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
        .spyOn(productRepository, 'deleteProductDetailsByIdInDb')
        .mockResolvedValue(false);

      const result = await productService.deleteProductDetails(productId);

      expect(productRepository.productDetailsByIdInDb).toHaveBeenCalledWith(
        productId,
      );
      expect(
        productRepository.deleteProductDetailsByIdInDb,
      ).toHaveBeenCalledWith(productId);

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Failed to delete the product.',
        details: null,
      });
    });

    it('should handle unexpected errors', async () => {
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
        .spyOn(productRepository, 'deleteProductDetailsByIdInDb')
        .mockResolvedValue(false);
      jest
        .spyOn(productRepository, 'deleteProductDetailsByIdInDb')
        .mockImplementation(() => {
          throw new Error('Internal server error');
        });

      const result = await productService.deleteProductDetails(productId);

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Internal server error',
        details: ['Internal server error'],
      });
    });
  });

  describe('getProductDetails', () => {
    it('should return product details when all arguments are provided', async () => {
      const mockCategoryName = categoryDto.name;
      const mockProductName = productDto.name;
      const mockAttributeKey = attributeDto.key;
      const mockProductDetails = [
        {
          id: productId,
          name: productDto.name,
          category: {
            id: categoryId,
            name: categoryDto.name,
            parent: null,
            children: [],
          },
          attributes: [
            {
              id: attributeId,
              key: attributeDto.key,
              value: attributeDto.value,
              product: {
                id: productId,
                name: productDto.name,
              } as ProductEntity,
            },
          ],
          description: productDto.description,
          price: productDto.price,
        },
      ];

      jest
        .spyOn(
          productRepository,
          'fetchProductDetailsByProductCategoryAndAttributeNameInDb',
        )
        .mockResolvedValue(mockProductDetails);

      const result = await productService.getProductDetails(
        mockCategoryName,
        mockProductName,
        mockAttributeKey,
      );

      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Product details fetched successfully.',
        details: mockProductDetails,
      });
      expect(
        productRepository.fetchProductDetailsByProductCategoryAndAttributeNameInDb,
      ).toHaveBeenCalledWith({
        whereClause:
          '1=1 AND p.name LIKE $1 AND c.name LIKE $2 AND a.key LIKE $3',
        params: [
          `%${mockProductName.toLowerCase()}%`,
          `%${mockCategoryName.toLowerCase()}%`,
          `%${mockAttributeKey.toLowerCase()}%`,
        ],
      });
    });

    it('should return product details when only categoryName is provided', async () => {
      const mockCategoryName = categoryDto.name;
      const mockProductDetails = [
        {
          id: productId,
          name: productDto.name,
          category: {
            id: categoryId,
            name: categoryDto.name,
            parent: null,
            children: [],
          },
          attributes: [
            {
              id: attributeId,
              key: attributeDto.key,
              value: attributeDto.value,
              product: {
                id: productId,
                name: productDto.name,
              } as ProductEntity,
            },
          ],
          description: productDto.description,
          price: productDto.price,
        },
      ];

      jest
        .spyOn(
          productRepository,
          'fetchProductDetailsByProductCategoryAndAttributeNameInDb',
        )
        .mockResolvedValue(mockProductDetails);

      const result = await productService.getProductDetails(
        mockCategoryName,
        null,
        null,
      );

      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Product details fetched successfully.',
        details: mockProductDetails,
      });
      expect(
        productRepository.fetchProductDetailsByProductCategoryAndAttributeNameInDb,
      ).toHaveBeenCalledWith({
        whereClause: '1=1 AND c.name LIKE $1',
        params: [`%${mockCategoryName.toLowerCase()}%`],
      });
    });

    it('should return product details when only productName is provided', async () => {
      const mockProductName = productDto.name;
      const mockProductDetails = [
        {
          id: productId,
          name: productDto.name,
          category: {
            id: categoryId,
            name: categoryDto.name,
            parent: null,
            children: [],
          },
          attributes: [
            {
              id: attributeId,
              key: attributeDto.key,
              value: attributeDto.value,
              product: {
                id: productId,
                name: productDto.name,
              } as ProductEntity,
            },
          ],
          description: productDto.description,
          price: productDto.price,
        },
      ];

      jest
        .spyOn(
          productRepository,
          'fetchProductDetailsByProductCategoryAndAttributeNameInDb',
        )
        .mockResolvedValue(mockProductDetails);

      const result = await productService.getProductDetails(
        null,
        mockProductName,
        null,
      );

      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Product details fetched successfully.',
        details: mockProductDetails,
      });
      expect(
        productRepository.fetchProductDetailsByProductCategoryAndAttributeNameInDb,
      ).toHaveBeenCalledWith({
        whereClause: '1=1 AND p.name LIKE $1',
        params: [`%${mockProductName.toLowerCase()}%`],
      });
    });

    it('should return product details when only attributeKey is provided', async () => {
      const mockAttributeKey = attributeDto.key;
      const mockProductDetails = [
        {
          id: productId,
          name: productDto.name,
          category: {
            id: categoryId,
            name: categoryDto.name,
            parent: null,
            children: [],
          },
          attributes: [
            {
              id: attributeId,
              key: attributeDto.key,
              value: attributeDto.value,
              product: {
                id: productId,
                name: productDto.name,
              } as ProductEntity,
            },
          ],
          description: productDto.description,
          price: productDto.price,
        },
      ];

      jest
        .spyOn(
          productRepository,
          'fetchProductDetailsByProductCategoryAndAttributeNameInDb',
        )
        .mockResolvedValue(mockProductDetails);

      const result = await productService.getProductDetails(
        null,
        null,
        mockAttributeKey,
      );

      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Product details fetched successfully.',
        details: mockProductDetails,
      });
      expect(
        productRepository.fetchProductDetailsByProductCategoryAndAttributeNameInDb,
      ).toHaveBeenCalledWith({
        whereClause: '1=1 AND a.key LIKE $1',
        params: [`%${mockAttributeKey.toLowerCase()}%`],
      });
    });

    it('should return all product details when no arguments are provided', async () => {
      const mockProductDetails = [
        {
          id: productId,
          name: productDto.name,
          category: {
            id: categoryId,
            name: categoryDto.name,
            parent: null,
            children: [],
          },
          attributes: [
            {
              id: attributeId,
              key: attributeDto.key,
              value: attributeDto.value,
              product: {
                id: productId,
                name: productDto.name,
              } as ProductEntity,
            },
          ],
          description: productDto.description,
          price: productDto.price,
        },
      ];
      jest
        .spyOn(
          productRepository,
          'fetchProductDetailsByProductCategoryAndAttributeNameInDb',
        )
        .mockResolvedValue(mockProductDetails);

      jest
        .spyOn(
          productRepository,
          'fetchProductDetailsByProductCategoryAndAttributeNameInDb',
        )
        .mockResolvedValue(mockProductDetails);

      const result = await productService.getProductDetails(null, null, null);

      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Product details fetched successfully.',
        details: mockProductDetails,
      });
      expect(
        productRepository.fetchProductDetailsByProductCategoryAndAttributeNameInDb,
      ).toHaveBeenCalledWith({
        whereClause: '1=1',
        params: [],
      });
    });

    it('should return not found response when no products match the criteria', async () => {
      jest
        .spyOn(
          productRepository,
          'fetchProductDetailsByProductCategoryAndAttributeNameInDb',
        )
        .mockResolvedValue(null);

      const result = await productService.getProductDetails(
        'invalidCategory',
        'invalidProduct',
        'invalidAttribute',
      );

      expect(result).toEqual({
        success: false,
        status: 404,
        message: 'No products found for the given criteria.',
        details: null,
      });
    });

    it('should handle unexpected errors', async () => {
      jest
        .spyOn(
          productRepository,
          'fetchProductDetailsByProductCategoryAndAttributeNameInDb',
        )
        .mockRejectedValue(new Error('Database connection error'));

      const result = await productService.getProductDetails(
        'electronics',
        'laptop',
        'color',
      );

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Internal server error',
        details: ['Database connection error'],
      });
    });
  });
});
