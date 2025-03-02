import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Body,
  Param,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto } from './category.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ControllerResponseDataType,
  ControllerResponse,
} from 'src/Utils/apiResponseType';
import { ValidIdDto } from 'src/Utils/sharedDto.utils';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new category' })
  @ApiResponse({ status: 200, description: 'Category successfully added' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or error in adding a new category',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict: input name already exist as a category or sub category in the database',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addCategory(
    @Body() categoryDto: CategoryDto,
  ): Promise<ControllerResponseDataType> {
    const result = await this.categoryService.addCategory(categoryDto);
    return ControllerResponse(result.status, result.message, result.details);
  }

  @Post(':id')
  @ApiOperation({ summary: 'Add a subcategory to an existing category' })
  @ApiResponse({ status: 200, description: 'Subcategory successfully added' })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input id type or an error occurred while adding the subcategory.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category details not found of provided id',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict error: The category name and subcategory name cannot be the same, or the subcategory already exists as a category/subcategory in the database.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addSubCategory(
    @Param() validIdDto: ValidIdDto,
    @Body() categoryDto: CategoryDto,
  ): Promise<ControllerResponseDataType> {
    const result = await this.categoryService.addSubCategory(
      validIdDto.id,
      categoryDto,
    );
    return ControllerResponse(result.status, result.message, result.details);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update the name of a category' })
  @ApiResponse({
    status: 200,
    description: 'Category data updated successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input id type or an error occurred while updating the category details.',
  })
  @ApiResponse({
    status: 409,
    description: `Conflict: The provided category name is either the same as its parent category, 
    already exists as a category, or is a duplicate subcategory under this category. Please enter a unique name.`,
  })
  @ApiResponse({
    status: 404,
    description: 'Category details not found for the given category id',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateCategoryName(
    @Param() validIdDto: ValidIdDto,
    @Body() categoryDto: CategoryDto,
  ): Promise<ControllerResponseDataType> {
    const result = await this.categoryService.updateCategoryName(
      validIdDto.id,
      categoryDto,
    );
    return ControllerResponse(result.status, result.message, result.details);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'Category successfully deleted' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input id type or error in deleting category data',
  })
  @ApiResponse({
    status: 404,
    description: 'Category details not found for the given category id',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteCategory(
    @Param() validIdDto: ValidIdDto,
  ): Promise<ControllerResponseDataType> {
    const result = await this.categoryService.deleteCategoryDetails(
      validIdDto.id,
    );
    return ControllerResponse(result.status, result.message, result.details);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get categories and its subcategories by id' })
  @ApiResponse({
    status: 200,
    description: 'Data fetched successfully of provided id',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input id type or any error occurred while fetching the data',
  })
  @ApiResponse({
    status: 404,
    description: 'Category details not found for the given category id',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllCategoryDetails(
    @Param() validIdDto: ValidIdDto,
  ): Promise<ControllerResponseDataType> {
    const result =
      await this.categoryService.fetchAllCategoryAndSubCategoryDetails(
        validIdDto.id,
      );
    return ControllerResponse(result.status, result.message, result.details);
  }
}
