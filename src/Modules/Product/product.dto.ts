import {
  IsString,
  IsNotEmpty,
  MinLength,
  Min,
  IsOptional,
  IsNumber,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({
    description:
      'The name of the product. Must be a string with at least 3 characters, containing only alphanumeric characters.',
    minLength: 3,
    example: 'Apple',
  })
  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty({ message: 'Name cannot be empty.' })
  @MinLength(3, { message: 'Name must be at least 3 characters long.' })
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Name must only contain alphanumeric characters.',
  })
  @Transform(({ value }) => value?.toLowerCase())
  name: string;

  @ApiProperty({
    description:
      'The description of the product. Optional, but if provided, it must be a string with at least 3 characters.',
    minLength: 3,
    example: 'The latest iPhone model.',
  })
  @IsString({ message: 'Description must be a string.' })
  @IsOptional()
  @MinLength(3, { message: 'Description must be at least 3 characters long.' })
  @Transform(({ value }) => value?.toLowerCase())
  description: string;

  @ApiProperty({
    description:
      'The price of the product. Must be a number with a minimum value of 1.',
    example: 100,
  })
  @IsNumber({}, { message: 'Price must be a valid number.' })
  @IsNotEmpty({ message: 'Price cannot be empty.' })
  @Min(1, { message: 'Price must be at least 1.' })
  price: number;
}
