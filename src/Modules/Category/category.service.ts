import { Injectable } from '@nestjs/common';
import { CategoryDto } from './category.dto';
import { CategoryRepository } from 'src/Repository/category.repository';
import { ResponseHandler } from 'src/Utils/responseHandler.utils';
import { ServiceResponseDataType } from 'src/Utils/apiResponseType';
@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly responseHandler: ResponseHandler,
  ) {}

  async addCategory(
    categoryDto: CategoryDto,
  ): Promise<ServiceResponseDataType> {
    try {
      const [duplicateCategoryByName, existingSubCategory] = await Promise.all([
        this.categoryRepository.categoryDetailByNameFromDb(categoryDto.name),
        this.categoryRepository.subCategoryNameFromDb(categoryDto.name),
      ]);

      if (duplicateCategoryByName) {
        return this.responseHandler.conflictResponse(
          `Conflict: ${categoryDto.name} name already existed as a category`,
        );
      }

      if (existingSubCategory) {
        return this.responseHandler.conflictResponse(
          `Conflict: ${categoryDto.name} already existed as a sub category. Enter a unique category name`,
        );
      }

      const isCategoryAdded = await this.categoryRepository.addNewCategoryInDb(
        categoryDto.name,
      );

      if (!isCategoryAdded) {
        return this.responseHandler.badRequestResponse(
          'Error in adding a new category',
        );
      }
      return this.responseHandler.successResponse(
        `A new ${categoryDto.name} category added successfully `,
      );
    } catch (error) {
      return this.responseHandler.unexpectedErrorResponse(error.message);
    }
  }

  async addSubCategory(
    id: string,
    categoryDto: CategoryDto,
  ): Promise<ServiceResponseDataType> {
    try {
      const [existingCategory, duplicateCategoryName, existingSubCategory] =
        await Promise.all([
          this.categoryRepository.categoryDetailsByIdFromDb(id),
          this.categoryRepository.categoryDetailByNameFromDb(categoryDto.name),
          this.categoryRepository.subCategoryNameOfCategoryIdFromDb({
            name: categoryDto.name,
            id: id,
          }),
        ]);

      if (!existingCategory) {
        return this.responseHandler.notFoundResponse(
          `The category for id ${id} does not exist. Please create the category first.`,
        );
      }
      if (existingCategory[0]?.name === categoryDto.name) {
        return this.responseHandler.conflictResponse(
          'The category name and subcategory name cannot be the same. Please provide a unique subcategory name.',
        );
      }
      if (duplicateCategoryName) {
        return this.responseHandler.conflictResponse(
          `${categoryDto.name} already exists as a category in the database.`,
        );
      }
      if (existingSubCategory) {
        return this.responseHandler.conflictResponse(
          `The name '${categoryDto.name}' already exists as a subcategory in the database with the id ${id}`,
        );
      }

      const newSubCategory = await this.categoryRepository.addSubCategoryInDb({
        id: existingCategory[0]?.id,
        name: categoryDto.name,
      });

      if (newSubCategory) {
        return this.responseHandler.successResponse(
          `The subcategory '${categoryDto.name}' has been successfully added under the category '${existingCategory[0]?.name}'.`,
          null,
        );
      }
      return this.responseHandler.badRequestResponse(
        'An error occurred while adding the subcategory. Please try again later.',
      );
    } catch (error) {
      return this.responseHandler.unexpectedErrorResponse(error.message);
    }
  }

  async updateCategoryName(
    id: string,
    categoryDto: CategoryDto,
  ): Promise<ServiceResponseDataType> {
    try {
      const [
        existingCategoryById,
        duplicateCategoryByName,
        existingSubCategory,
      ] = await Promise.all([
        this.categoryRepository.categoryDetailsByIdFromDb(id),
        this.categoryRepository.categoryDetailByNameFromDb(categoryDto.name),
        this.categoryRepository.subCategoryNameFromDb(categoryDto.name),
      ]);

      if (!existingCategoryById) {
        return this.responseHandler.notFoundResponse(
          'Invalid id, No Details found',
        );
      }
      const categoryEntity = existingCategoryById?.[0] ?? null;

      if (categoryEntity.parent && categoryEntity.parent.id) {
        const parentCategoryDetails =
          await this.categoryRepository.categoryDetailsByIdFromDb(
            categoryEntity?.parent.id,
          );
        if (parentCategoryDetails?.[0]?.name === categoryDto.name) {
          return this.responseHandler.conflictResponse(
            `Conflict: ${categoryDto.name} cannot be same as parent category name. Enter a unique category name.`,
          );
        }
      }

      if (duplicateCategoryByName && duplicateCategoryByName[0]?.id !== id) {
        return this.responseHandler.conflictResponse(
          `Conflict: ${categoryDto.name} name already existed. Enter a unique category name.`,
        );
      }
      if (existingSubCategory?.length > 0 && existingSubCategory[0]?.parent) {
        const conflictSubCategory = existingSubCategory?.some((details) => {
          return (
            details.name === categoryDto.name &&
            details.parent?.id === categoryEntity?.id &&
            details.id !== id &&
            details.parent?.name !== categoryDto.name
          );
        });

        if (conflictSubCategory) {
          return this.responseHandler.conflictResponse(
            `Conflict: ${categoryDto.name} already exists as a subcategory under this category. Enter a unique category name.`,
          );
        }
      }

      const updatedCategory =
        await this.categoryRepository.updateCategoryNameInDb({
          id: id,
          name: categoryDto.name,
        });
      if (updatedCategory) {
        return this.responseHandler.successResponse(
          'Category data updated successfully',
          null,
        );
      }

      return this.responseHandler.badRequestResponse(
        'Unable to update category details currently',
      );
    } catch (error) {
      return this.responseHandler.unexpectedErrorResponse(error.message);
    }
  }

  async deleteCategoryDetails(id: string): Promise<ServiceResponseDataType> {
    try {
      const existingCategoryById =
        await this.categoryRepository.categoryDetailsByIdFromDb(id);
      if (!existingCategoryById) {
        return this.responseHandler.notFoundResponse(
          'Invalid id, No Details found',
        );
      }

      const deletedCategory =
        await this.categoryRepository.deleteCategoryDetailsInDb(id);
      if (deletedCategory) {
        return this.responseHandler.successResponse(
          `All details related to id ${id} deleted from the database`,
          null,
        );
      }

      return this.responseHandler.badRequestResponse(
        `Unable to delete the details from the database`,
      );
    } catch (error) {
      return this.responseHandler.unexpectedErrorResponse(error.message);
    }
  }

  async fetchAllCategoryAndSubCategoryDetails(
    id: string,
  ): Promise<ServiceResponseDataType> {
    try {
      const categoryAndSubCategoryDetails =
        await this.categoryRepository.fetchAllCategoryAndSubCategoryDetailsByIdInDb(
          id,
        );
      if (!categoryAndSubCategoryDetails) {
        return this.responseHandler.notFoundResponse(
          `Category details not found for id ${id}`,
        );
      }

      return this.responseHandler.successResponse(
        `Data fetched successfully for the id ${id}`,
        categoryAndSubCategoryDetails,
      );
    } catch (error) {
      return this.responseHandler.unexpectedErrorResponse(error.message);
    }
  }
}
