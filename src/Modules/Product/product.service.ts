import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/Repository/product.repository';
import { ProductDto } from './product.dto';
import { CategoryRepository } from 'src/Repository/category.repository';
import { ResponseHandler } from 'src/Utils/responseHandler.utils';
import { ServiceResponseDataType } from 'src/Utils/apiResponseType';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly responseHandler: ResponseHandler,
  ) {}

  async addNewProduct(
    id: string,
    productDto: ProductDto,
  ): Promise<ServiceResponseDataType> {
    try {
      const [checkCategoryExists, checkProductExists] = await Promise.all([
        this.categoryRepository.categoryDetailsByIdFromDb(id),
        this.productRepository.productDetailsByNameAndCategoryIdInDb({
          name: productDto.name,
          category_id: id,
        }),
      ]);
      if (!checkCategoryExists) {
        return this.responseHandler.notFoundResponse(
          'Category not found for the provided id.',
        );
      }

      if (checkProductExists) {
        return this.responseHandler.conflictResponse(
          `Product with name '${productDto.name}' already exists in the category id ${id}`,
        );
      }

      const savedProduct = await this.productRepository.addProduct({
        name: productDto.name,
        description: productDto.description,
        price: productDto.price,
        id,
      });

      if (!savedProduct) {
        return this.responseHandler.badRequestResponse(
          'Failed to add the product.',
        );
      }

      return this.responseHandler.successResponse(
        'Product added successfully.',
      );
    } catch (error) {
      return this.responseHandler.unexpectedErrorResponse(error.message);
    }
  }

  async updateProductDetails(
    productId: string,
    productDto: ProductDto,
  ): Promise<ServiceResponseDataType> {
    try {
      const existingProduct =
        await this.productRepository.productDetailsByIdInDb(productId);

      const categoryId = existingProduct?.[0]?.category?.id;

      const [conflictingProductName, productDetailsWithCategoryId] =
        await Promise.all([
          this.productRepository.productDetailsByNameAndCategoryIdInDb({
            name: productDto.name,
            category_id: categoryId,
          }),
          this.productRepository.fetchProductDetailsWithProductIdAndCategoryId({
            productId: productId,
            categoryId: categoryId,
          }),
        ]);

      if (!existingProduct) {
        return this.responseHandler.notFoundResponse(
          'Product not found for the provided id.',
        );
      }

      if (
        Array.isArray(conflictingProductName) &&
        conflictingProductName.length > 0 &&
        conflictingProductName[0]?.id !== productId
      ) {
        return this.responseHandler.conflictResponse(
          `Conflict: The product name '${productDto.name}' is already in use with the category of id ${categoryId}`,
        );
      }

      if (!productDetailsWithCategoryId) {
        return this.responseHandler.conflictResponse(
          `Conflict: Product id of ${productId} is not linked with category id of ${categoryId}`,
        );
      }

      const updateResult =
        await this.productRepository.updateProductDetailsInDb({
          name: productDto.name,
          description: productDto.description,
          price: productDto.price,
          id: productId,
        });

      if (!updateResult) {
        return this.responseHandler.badRequestResponse(
          'Failed to update the product.',
        );
      }

      return this.responseHandler.successResponse(
        'Product updated successfully.',
        null,
      );
    } catch (error) {
      return this.responseHandler.unexpectedErrorResponse(error.message);
    }
  }

  async deleteProductDetails(id: string): Promise<ServiceResponseDataType> {
    try {
      const productExists =
        await this.productRepository.productDetailsByIdInDb(id);
      if (!productExists) {
        return this.responseHandler.notFoundResponse(
          'Product not found for the provided id.',
        );
      }

      const deleteResult =
        await this.productRepository.deleteProductDetailsByIdInDb(id);
      if (deleteResult) {
        return this.responseHandler.successResponse(
          'Product deleted successfully.',
          null,
        );
      }

      return this.responseHandler.badRequestResponse(
        'Failed to delete the product.',
      );
    } catch (error) {
      return this.responseHandler.unexpectedErrorResponse(error.message);
    }
  }

  async getProductDetails(
    categoryName: string,
    productName: string,
    attributeKey: string,
  ): Promise<ServiceResponseDataType> {
    try {
      let whereClause = '1=1';
      const params: string[] = [];

      if (productName) {
        whereClause += ` AND p.name LIKE $${params.length + 1}`;
        params.push(`%${productName?.toLowerCase() || ''}%`);
      }

      if (categoryName) {
        whereClause += ` AND c.name LIKE $${params.length + 1}`;
        params.push(`%${categoryName?.toLowerCase() || ''}%`);
      }

      if (attributeKey) {
        whereClause += ` AND a.key LIKE $${params.length + 1}`;
        params.push(`%${attributeKey?.toLowerCase() || ''}%`);
      }

      const productDetails =
        await this.productRepository.fetchProductDetailsByProductCategoryAndAttributeNameInDb(
          {
            whereClause,
            params,
          },
        );

      if (productDetails) {
        return this.responseHandler.successResponse(
          'Product details fetched successfully.',
          productDetails,
        );
      }

      return this.responseHandler.notFoundResponse(
        `No products found for the given criteria.`,
      );
    } catch (error) {
      return this.responseHandler.unexpectedErrorResponse(error.message);
    }
  }
}
