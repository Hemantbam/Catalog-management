import { Injectable } from '@nestjs/common';
import { AttributeRepository } from 'src/Repository/attribute.repository';
import { AttributeDto } from './attribute.dto';
import { ProductRepository } from 'src/Repository/product.repository';
import { ResponseHandler } from 'src/Utils/responseHandler.utils';
import { ServiceResponseDataType } from 'src/Utils/apiResponseType';
@Injectable()
export class AttributeService {
  constructor(
    private readonly attributeRepository: AttributeRepository,
    private readonly productRepository: ProductRepository,
    private readonly responseHandler: ResponseHandler,
  ) {}

  async addNewAttribute(
    id: string,
    attributeDto: AttributeDto,
  ): Promise<ServiceResponseDataType> {
    try {
      const [productDetails, existingAttributeKey] = await Promise.all([
        this.productRepository.productDetailsByIdInDb(id),
        this.attributeRepository.fetchAttributeDataWithKeyAndProductIdInDb({
          productId: id,
          key: attributeDto.key,
        }),
      ]);

      if (!productDetails) {
        return this.responseHandler.notFoundResponse(
          'Invalid product id, No Details found',
        );
      }
      if (existingAttributeKey) {
        return this.responseHandler.conflictResponse(
          `${attributeDto.key} key attribute is already registered with the provided id ${id}`,
        );
      }

      const isAttributeInserted =
        await this.attributeRepository.addNewAttributeInDb({
          productId: id,
          key: attributeDto.key,
          value: attributeDto.value,
        });
      if (isAttributeInserted) {
        return this.responseHandler.successResponse(
          'Attribute successfully added to the database',
          null,
        );
      }

      return this.responseHandler.badRequestResponse(
        'Unable to add a new attribute',
      );
    } catch (error) {
      return this.responseHandler.unexpectedErrorResponse(error.message);
    }
  }

  async updateAttribute(
    attributeId: string,
    productId: string,
    attributeDto: AttributeDto,
  ): Promise<ServiceResponseDataType> {
    try {
      const [
        productDetails,
        attributeDetails,
        existingAttributeKey,
        checkProductAttributeLink,
      ] = await Promise.all([
        this.productRepository.productDetailsByIdInDb(productId),
        this.attributeRepository.fetchAttributeDataByIdInDb(attributeId),
        this.attributeRepository.fetchAttributeDataWithKeyAndProductIdInDb({
          productId: productId,
          key: attributeDto.key,
        }),
        this.attributeRepository.fetchProductDetailsWithAttributeIdAndProductId(
          {
            productId: productId,
            attributeId: attributeId,
          },
        ),
      ]);
      if (!productDetails) {
        return this.responseHandler.notFoundResponse(
          'Invalid product id, No Details found',
        );
      }

      if (!attributeDetails) {
        return this.responseHandler.notFoundResponse(
          'Invalid attribute id, No Details found',
        );
      }
      if (!checkProductAttributeLink) {
        return this.responseHandler.conflictResponse(
          `Conflict: Product id of ${productId} is not linked with attribute id of ${attributeId}`,
        );
      }

      if (existingAttributeKey && existingAttributeKey[0]?.id !== attributeId) {
        return this.responseHandler.conflictResponse(
          `Conflict: The key '${attributeDto.key}' is already in use with the product of id ${productId}`,
        );
      }

      const isAttributeUpdated =
        await this.attributeRepository.updateAttributeDataInDb({
          id: attributeId,
          productId: productId,
          key: attributeDto.key,
          value: attributeDto.value,
        });
      if (isAttributeUpdated) {
        return this.responseHandler.successResponse(
          `Key '${attributeDto.key}' with value '${attributeDto.value}' data updated successfully to the database of attribute id ${attributeId}`,
          null,
        );
      }

      return this.responseHandler.badRequestResponse(
        'Unable to update attribute',
      );
    } catch (error) {
      return this.responseHandler.unexpectedErrorResponse(error.message);
    }
  }

  async deleteAttribute(
    productId: string,
    attributeId: string,
  ): Promise<ServiceResponseDataType> {
    try {
      const [productDetails, attributeDetails] = await Promise.all([
        this.productRepository.productDetailsByIdInDb(productId),
        this.attributeRepository.fetchAttributeDataByIdInDb(attributeId),
      ]);

      if (!productDetails) {
        return this.responseHandler.notFoundResponse(
          `No Details found for the product id ${productId}`,
        );
      }

      if (!attributeDetails) {
        return this.responseHandler.notFoundResponse(
          `No Details found for the attribute id ${attributeId}`,
        );
      }
      if (attributeDetails && attributeDetails[0]?.product.id !== productId) {
        return this.responseHandler.conflictResponse(
          `The attribute ID ${attributeId} does not belong to the product with ID ${productId}. Please verify the attribute ID and ensure it matches the product you are trying to delete.`,
        );
      }

      const isAttributeRemoved =
        await this.attributeRepository.deleteAttributeDataFromDb({
          product_id: productId,
          attribute_id: attributeId,
        });
      if (isAttributeRemoved) {
        return this.responseHandler.successResponse(
          `Attribute data deleted successfully`,
          null,
        );
      }

      return this.responseHandler.badRequestResponse(
        `Unable to delete attribute data`,
      );
    } catch (error) {
      return this.responseHandler.unexpectedErrorResponse(error.message);
    }
  }
}
