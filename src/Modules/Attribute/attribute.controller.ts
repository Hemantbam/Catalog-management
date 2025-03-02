import { Controller, Param, Body, Post, Put, Delete } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { AttributeDto } from './attribute.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ControllerResponseDataType,
  ControllerResponse,
} from 'src/Utils/apiResponseType';
import { ValidIdDto } from 'src/Utils/sharedDto.utils';
@ApiTags('Attributes')
@Controller('products')

export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Post(':id/attributes')
  @ApiOperation({ summary: 'Add a new attribute' })
  @ApiResponse({
    status: 200,
    description: 'Attribute added successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input id type or error while adding the attribute details',
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid id, no details found',
  })
  @ApiResponse({
    status: 409,
    description:
      'attribute name already existed in the database with the same product',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async addAttribute(
    @Param() validIdDto: ValidIdDto,
    @Body() attributeDto: AttributeDto,
  ): Promise<ControllerResponseDataType> {
    const result = await this.attributeService.addNewAttribute(
      validIdDto.id,
      attributeDto,
    );
    return ControllerResponse(result.status, result.message, result.details);
  }

  @Put(':id/attributes/:attribute_id')
  @ApiOperation({ summary: 'Update an attribute' })
  @ApiResponse({
    status: 200,
    description: 'Attribute updated successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input id type or error while updating the attribute details',
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid id, no details found on database',
  })
  @ApiResponse({
    status: 409,
    description: 'attribute id does not belong with the product id',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async updateAttribute(
    @Param() productId: ValidIdDto,
    @Param() attributeId: ValidIdDto,
    @Body() attributeDto: AttributeDto,
  ): Promise<ControllerResponseDataType> {
    const result = await this.attributeService.updateAttribute(
      attributeId.attribute_id,
      productId.id,
      attributeDto,
    );
    return ControllerResponse(result.status, result.message, result.details);
  }

  @Delete(':id/attributes/:attribute_id')
  @ApiOperation({ summary: 'Delete an attribute' })
  @ApiResponse({
    status: 200,
    description: 'Attribute deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input id type or error while deleting the attribute data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid id, no details found on database',
  })
  @ApiResponse({
    status: 409,
    description: 'attribute id does not belong with the product id',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async deleteAttributeDetails(
    @Param() productId: ValidIdDto,
    @Param() attributeId: ValidIdDto,
  ): Promise<ControllerResponseDataType> {
    const result = await this.attributeService.deleteAttribute(
      productId.id,
      attributeId.attribute_id,
    );
    return ControllerResponse(result.status, result.message, result.details);
  }
}
