import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from './product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import {
  ControllerResponseDataType,
  ControllerResponse,
} from 'src/Utils/apiResponseType';
import { ValidIdDto } from 'src/Utils/sharedDto.utils';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Post(':id')
  @ApiOperation({ summary: 'Add a new product' })
  @ApiResponse({
    status: 200,
    description: 'Product added successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input id type or error while adding the product.',
  })
  @ApiResponse({
    status: 404,
    description: 'No details found for the category id.',
  })
  @ApiResponse({
    status: 409,
    description: 'Product name already exist in database',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async addProduct(
    @Param() validIdDto: ValidIdDto,
    @Body() productDto: ProductDto,
  ): Promise<ControllerResponseDataType> {
    const result = await this.productService.addNewProduct(
      validIdDto.id,
      productDto,
    );
    return ControllerResponse(result.status, result.message, result.details);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product details' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input id type or error while update the product data',
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid id, no details found',
  })
  @ApiResponse({
    status: 409,
    description:
      'Product name already exist in database within the provided category id.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async updateProductDetails(
    @Param() productId: ValidIdDto,
    @Body() productDto: ProductDto,
  ): Promise<ControllerResponseDataType> {
    const result = await this.productService.updateProductDetails(
      productId.id,
      productDto,
    );
    return ControllerResponse(result.status, result.message, result.details);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product details' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input id type or error while deleting the product data',
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid id, no details found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async deleteProductDetails(
    @Param() validIdDto: ValidIdDto,
  ): Promise<ControllerResponseDataType> {
    const result = await this.productService.deleteProductDetails(
      validIdDto.id,
    );
    return ControllerResponse(result.status, result.message, result.details);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product details' })
  @ApiResponse({
    status: 200,
    description: 'Product data fetched successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Error while fetching the product data',
  })
  @ApiResponse({
    status: 404,
    description: 'No details found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiQuery({
    name: 'categoryName',
    required: false,
    description: 'The category name of the product',
    example: 'electronics',
  })
  @ApiQuery({
    name: 'productName',
    required: false,
    description: 'The product name',
    example: 'apple',
  })
  @ApiQuery({
    name: 'attributeKey',
    required: false,
    description: 'The key of the product attribute',
    example: 'iphone16',
  })
  async getProductDetails(
    @Query('categoryName') categoryName: string,
    @Query('productName') productName: string,
    @Query('attributeKey') attributeKey: string,
  ): Promise<ControllerResponseDataType> {
    const result = await this.productService.getProductDetails(
      categoryName,
      productName,
      attributeKey,
    );
    return ControllerResponse(result.status, result.message, result.details);
  }
}
