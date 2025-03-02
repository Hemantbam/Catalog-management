import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AttributeDto {
  @ApiProperty({
    description:
      'The key of the attribute. Must be a string with min 3 character long.',
    minLength: 3,
    example: 'Color',
  })
  @IsString({ message: 'Key must be a string.' })
  @IsNotEmpty({ message: 'Key cannot be empty.' })
  @MinLength(3, { message: 'Key must be at least 3 characters long.' })
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Name must only contain alphanumeric characters.',
  })
  @Transform(({ value }) => value?.toLowerCase())
  key: string;

  @ApiProperty({
    description:
      'The value of the attribute. Must be a string with min 3 character long.',
    minLength: 3,
    example: 'Red',
  })
  @IsString({ message: 'Value must be a string.' })
  @IsNotEmpty({ message: 'Key cannot be empty.' })
  @MinLength(3, { message: 'Value must be at least 3 characters long.' })
  @Matches(/^[a-zA-Z0-9,\s]+$/, {
    message: 'value must only contain alphanumeric characters.',
  })
  @Transform(({ value }) => value?.toLowerCase())
  value: string;
}
