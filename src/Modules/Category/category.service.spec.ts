import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from 'src/Repository/category.repository';
import { CategoryDto } from './category.dto';
import { ResponseHandler } from 'src/Utils/responseHandler.utils';
import { faker } from '@faker-js/faker/.';
import { CategoryEntity } from 'src/Entities/category.entity';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let categoryRepository: CategoryRepository;

  let categoryDto: CategoryDto;
  let categoryId: string;
  let subCategoryId: string;
  let parentCategoryId: string;

  beforeEach(async () => {
    categoryId = faker.string.uuid();
    subCategoryId = faker.string.uuid();
    parentCategoryId = faker.string.uuid();

    categoryDto = {
      name: faker.commerce.department().toLowerCase(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        ResponseHandler,
        {
          provide: CategoryRepository,
          useValue: {
            categoryDetailByNameFromDb: jest.fn(),
            addNewCategoryInDb: jest.fn(),
            categoryDetailsByIdFromDb: jest.fn(),
            addSubCategoryInDb: jest.fn(),
            subCategoryNameFromDb: jest.fn(),
            updateCategoryNameInDb: jest.fn(),
            deleteCategoryDetailsInDb: jest.fn(),
            subCategoryNameOfCategoryIdFromDb: jest.fn(),
            fetchAllCategoryAndSubCategoryDetailsByIdInDb: jest.fn(),
          },
        },
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  describe('addCategory', () => {
    it('should add a new category successfully', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailByNameFromDb')
        .mockResolvedValue(null);
      jest
        .spyOn(categoryRepository, 'addNewCategoryInDb')
        .mockResolvedValue(true);

      const result = await categoryService.addCategory(categoryDto);

      expect(
        categoryRepository.categoryDetailByNameFromDb,
      ).toHaveBeenCalledWith(categoryDto.name);

      expect(categoryRepository.addNewCategoryInDb).toHaveBeenCalledWith(
        categoryDto.name,
      );
      expect(result).toEqual({
        success: true,
        status: 200,
        message: `A new ${categoryDto.name} category added successfully `,
        details: null,
      });
    });

    it('should return conflict error when category name already exists', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailByNameFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: categoryDto.name,
            parent: null,
            children: [],
          },
        ]);

      const result = await categoryService.addCategory(categoryDto);

      expect(
        categoryRepository.categoryDetailByNameFromDb,
      ).toHaveBeenCalledWith(categoryDto.name);
      expect(result).toEqual({
        success: false,
        status: 409,
        message: `Conflict: ${categoryDto.name} name already existed as a category`,
        details: null,
      });
    });

    it('should return error when adding a category fails', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailByNameFromDb')
        .mockResolvedValue(null);
      jest
        .spyOn(categoryRepository, 'addNewCategoryInDb')
        .mockResolvedValue(null);

      const result = await categoryService.addCategory(categoryDto);

      expect(
        categoryRepository.categoryDetailByNameFromDb,
      ).toHaveBeenCalledWith(categoryDto.name);
      expect(categoryRepository.addNewCategoryInDb).toHaveBeenCalledWith(
        categoryDto.name,
      );
      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Error in adding a new category',
        details: null,
      });
    });

    it('should handle unexpected errors', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailByNameFromDb')
        .mockImplementation(() => {
          throw new Error('Internal server error');
        });

      const result = await categoryService.addCategory(categoryDto);

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Internal server error',
        details: ['Internal server error'],
      });
    });
  });

  describe('addSubCategory', () => {
    it('should return error if category does not exist', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue(null);

      const result = await categoryService.addSubCategory(
        categoryId,
        categoryDto,
      );

      expect(result).toEqual({
        success: false,
        status: 404,
        message: `The category for id ${categoryId} does not exist. Please create the category first.`,
        details: null,
      });
    });

    it('should return error if category name and subcategory name are the same', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: categoryDto.name,
            parent: null,
            children: [],
          },
        ]);

      const result = await categoryService.addSubCategory(
        categoryId,
        categoryDto,
      );

      expect(result).toEqual({
        success: false,
        status: 409,
        message:
          'The category name and subcategory name cannot be the same. Please provide a unique subcategory name.',
        details: null,
      });
    });

    it('should return error if subcategory name already exists as a category', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: 'existing-category',
            parent: new CategoryEntity(),
            children: [],
          },
        ]);
      jest
        .spyOn(categoryRepository, 'categoryDetailByNameFromDb')
        .mockResolvedValue([
          {
            id: subCategoryId,
            name: categoryDto.name,
            parent: new CategoryEntity(),
            children: [],
          },
        ]);

      const result = await categoryService.addSubCategory(
        categoryId,
        categoryDto,
      );

      expect(result).toEqual({
        success: false,
        status: 409,
        message: `${categoryDto.name} already exists as a category in the database.`,
        details: null,
      });
    });

    it('should return error if subcategory already exists under the category', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: 'existing-category',
            parent: new CategoryEntity(),
            children: [],
          },
        ]);
      jest
        .spyOn(categoryRepository, 'categoryDetailByNameFromDb')
        .mockResolvedValue(null);
      jest
        .spyOn(categoryRepository, 'subCategoryNameOfCategoryIdFromDb')
        .mockResolvedValue([
          {
            id: subCategoryId,
            name: categoryDto.name,
            parent: new CategoryEntity(),
            children: [],
          },
        ]);

      const result = await categoryService.addSubCategory(
        categoryId,
        categoryDto,
      );

      expect(result).toEqual({
        success: false,
        status: 409,
        message: `The name '${categoryDto.name}' already exists as a subcategory in the database with the id ${categoryId}`,
        details: null,
      });
    });

    it('should return error if subcategory creation fails', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: 'existing-category',
            parent: new CategoryEntity(),
            children: [],
          },
        ]);
      jest
        .spyOn(categoryRepository, 'categoryDetailByNameFromDb')
        .mockResolvedValue(null);
      jest
        .spyOn(categoryRepository, 'subCategoryNameOfCategoryIdFromDb')
        .mockResolvedValue(null);
      jest
        .spyOn(categoryRepository, 'addSubCategoryInDb')
        .mockResolvedValue(null);

      const result = await categoryService.addSubCategory(
        categoryId,
        categoryDto,
      );

      expect(result).toEqual({
        success: false,
        status: 400,
        message:
          'An error occurred while adding the subcategory. Please try again later.',
        details: null,
      });
    });

    it('should successfully add a subcategory', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: 'existing-category',
            parent: new CategoryEntity(),
            children: [],
          },
        ]);
      jest
        .spyOn(categoryRepository, 'categoryDetailByNameFromDb')
        .mockResolvedValue(null);
      jest
        .spyOn(categoryRepository, 'subCategoryNameOfCategoryIdFromDb')
        .mockResolvedValue(null);
      jest
        .spyOn(categoryRepository, 'addSubCategoryInDb')
        .mockResolvedValue(true);

      const result = await categoryService.addSubCategory(
        categoryId,
        categoryDto,
      );

      expect(result).toEqual({
        success: true,
        status: 200,
        message: `The subcategory '${categoryDto.name}' has been successfully added under the category 'existing-category'.`,
        details: null,
      });
    });

    it('should return an internal server error if an unexpected error occurs', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockImplementation(() => {
          throw new Error('Unexpected error');
        });

      const result = await categoryService.addSubCategory(
        categoryId,
        categoryDto,
      );

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Internal server error',
        details: ['Unexpected error'],
      });
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: 'Old Name',
            parent: { id: parentCategoryId },
          } as CategoryEntity,
        ]);
      jest
        .spyOn(categoryRepository, 'categoryDetailByNameFromDb')
        .mockResolvedValue(null);
      jest
        .spyOn(categoryRepository, 'subCategoryNameFromDb')
        .mockResolvedValue([]);
      jest
        .spyOn(categoryRepository, 'updateCategoryNameInDb')
        .mockResolvedValue(true);

      const result = await categoryService.updateCategoryName(
        categoryId,
        categoryDto,
      );

      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Category data updated successfully',
        details: null,
      });
    });

    it('should return error if category does not exist', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue(null);

      const result = await categoryService.updateCategoryName(
        categoryId,
        categoryDto,
      );

      expect(result).toEqual({
        success: false,
        status: 404,
        message: 'Invalid id, No Details found',
        details: null,
      });
    });

    it('should return conflict if category name already exists', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: 'Old Name',
            parent: { id: parentCategoryId },
          } as CategoryEntity,
        ]);
      jest
        .spyOn(categoryRepository, 'categoryDetailByNameFromDb')
        .mockResolvedValue([
          { id: faker.string.uuid(), name: categoryDto.name } as CategoryEntity,
        ]);

      const result = await categoryService.updateCategoryName(
        categoryId,
        categoryDto,
      );

      expect(result).toEqual({
        success: false,
        status: 409,
        message: `Conflict: ${categoryDto.name} name already existed. Enter a unique category name.`,
        details: null,
      });
    });

    it('should return conflict if category name exists in subcategories under the same parent', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: 'Old Name',
            parent: { id: parentCategoryId },
          } as CategoryEntity,
        ]);
      jest
        .spyOn(categoryRepository, 'categoryDetailByNameFromDb')
        .mockResolvedValue(null);
      jest
        .spyOn(categoryRepository, 'subCategoryNameFromDb')
        .mockResolvedValue([
          {
            id: faker.string.uuid(),
            name: categoryDto.name,
            parent: { id: categoryId },
          } as CategoryEntity,
        ]);

      const result = await categoryService.updateCategoryName(
        categoryId,
        categoryDto,
      );

      expect(result).toEqual({
        success: false,
        status: 409,
        message: `Conflict: ${categoryDto.name} already exists as a subcategory under this category. Enter a unique category name.`,
        details: null,
      });
    });

    it('should return bad request response when update fails', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: 'Old Name',
            parent: { id: parentCategoryId },
          } as CategoryEntity,
        ]);
      jest
        .spyOn(categoryRepository, 'categoryDetailByNameFromDb')
        .mockResolvedValue(null);
      jest
        .spyOn(categoryRepository, 'subCategoryNameFromDb')
        .mockResolvedValue([]);
      jest
        .spyOn(categoryRepository, 'updateCategoryNameInDb')
        .mockResolvedValue(false);

      const result = await categoryService.updateCategoryName(
        categoryId,
        categoryDto,
      );

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Unable to update category details currently',
        details: null,
      });
    });

    it('should call updateCategoryNameInDb with correct parameters', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: 'Old Name',
            parent: { id: parentCategoryId },
          } as CategoryEntity,
        ]);
      jest
        .spyOn(categoryRepository, 'categoryDetailByNameFromDb')
        .mockResolvedValue(null);
      jest
        .spyOn(categoryRepository, 'subCategoryNameFromDb')
        .mockResolvedValue([]);
      const updateSpy = jest
        .spyOn(categoryRepository, 'updateCategoryNameInDb')
        .mockResolvedValue(true);

      await categoryService.updateCategoryName(categoryId, categoryDto);

      expect(updateSpy).toHaveBeenCalledWith({
        id: categoryId,
        name: categoryDto.name,
      });
    });

    it('should return an unexpected error response on an internal server error', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockRejectedValue(new Error('Database error'));

      const result = await categoryService.updateCategoryName(
        categoryId,
        categoryDto,
      );

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Internal server error',
        details: ['Database error'],
      });
    });
  });

  describe('deleteCategoryDetails', () => {
    it('should return error if category does not exist', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue(null);

      const result = await categoryService.deleteCategoryDetails(categoryId);

      expect(result).toEqual({
        success: false,
        status: 404,
        message: 'Invalid id, No Details found',
        details: null,
      });
    });

    it('should successfully delete a category', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: categoryDto.name,
            parent: null,
            children: [],
          },
        ]);
      jest
        .spyOn(categoryRepository, 'deleteCategoryDetailsInDb')
        .mockResolvedValue(true);

      const result = await categoryService.deleteCategoryDetails(categoryId);

      expect(categoryRepository.categoryDetailsByIdFromDb).toHaveBeenCalledWith(
        categoryId,
      );
      expect(categoryRepository.deleteCategoryDetailsInDb).toHaveBeenCalledWith(
        categoryId,
      );
      expect(result).toEqual({
        success: true,
        status: 200,
        message: `All details related to id ${categoryId} deleted from the database`,
        details: null,
      });
    });

    it('should return error if deleting the category fails', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockResolvedValue([
          {
            id: categoryId,
            name: categoryDto.name,
            parent: null,
            children: [],
          },
        ]);
      jest
        .spyOn(categoryRepository, 'deleteCategoryDetailsInDb')
        .mockResolvedValue(null);

      const result = await categoryService.deleteCategoryDetails(categoryId);

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Unable to delete the details from the database',
        details: null,
      });
    });

    it('should handle unexpected errors', async () => {
      jest
        .spyOn(categoryRepository, 'categoryDetailsByIdFromDb')
        .mockImplementation(() => {
          throw new Error('Internal server error');
        });

      const result = await categoryService.deleteCategoryDetails(categoryId);

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Internal server error',
        details: ['Internal server error'],
      });
    });
  });

  describe('fetchAllCategoryAndSubCategoryDetails', () => {
    it('should return not found response if no categories exist', async () => {
      jest
        .spyOn(
          categoryRepository,
          'fetchAllCategoryAndSubCategoryDetailsByIdInDb',
        )
        .mockResolvedValue(null);

      const result =
        await categoryService.fetchAllCategoryAndSubCategoryDetails(categoryId);

      expect(
        categoryRepository.fetchAllCategoryAndSubCategoryDetailsByIdInDb,
      ).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual({
        success: false,
        status: 404,
        message: `Category details not found for id ${categoryId}`,
        details: null,
      });
    });

    it('should successfully return categories and subcategories', async () => {
      const mockCategoryData: CategoryEntity[] = [
        {
          id: categoryId,
          name: 'Games',
          parent: null,
          children: [],
        },
        {
          id: subCategoryId,
          name: 'Board Games',
          parent: {
            id: categoryId,
            name: 'Games',
            parent: null,
            children: [],
          },
          children: [],
        },
      ];

      jest
        .spyOn(
          categoryRepository,
          'fetchAllCategoryAndSubCategoryDetailsByIdInDb',
        )
        .mockResolvedValue(mockCategoryData);

      const result =
        await categoryService.fetchAllCategoryAndSubCategoryDetails(categoryId);

      expect(
        categoryRepository.fetchAllCategoryAndSubCategoryDetailsByIdInDb,
      ).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual({
        success: true,
        status: 200,
        message: `Data fetched successfully for the id ${categoryId}`,
        details: mockCategoryData,
      });
    });

    it('should return error if an unexpected error occurs', async () => {
      jest
        .spyOn(
          categoryRepository,
          'fetchAllCategoryAndSubCategoryDetailsByIdInDb',
        )
        .mockImplementation(() => {
          throw new Error('Internal server error');
        });

      const result =
        await categoryService.fetchAllCategoryAndSubCategoryDetails(categoryId);

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Internal server error',
        details: ['Internal server error'],
      });

      expect(
        categoryRepository.fetchAllCategoryAndSubCategoryDetailsByIdInDb,
      ).toHaveBeenCalledWith(categoryId);
    });
  });
});
