import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CategoryDto {
  @ApiProperty({
    description:
      'The name of the category must be string with minimum 3 character long',
    minLength: 3,
    example: 'Electronics',
  })
  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty()
  @MinLength(3, { message: 'Name must be at least 3 characters long.' })
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Name must only contain alphanumeric characters',
  })
  @Transform(({ value }) => value?.toLowerCase())
  name: string;
}
